const { Balance, User, sequelize } = require('../models');
const { Op } = require('sequelize');

const updateBalancesOnAdd = async (payerId, memberIds, shareAmount, currency, transaction) => {
  for (const memberId of memberIds) {
    if (memberId === payerId) continue;

    // Step A: Check if record exists where user_id=memberId AND owes_user_id=payerId
    const existingDebt = await Balance.findOne({
      where: { user_id: memberId, owes_user_id: payerId, currency },
      transaction
    });

    if (existingDebt) {
      existingDebt.amount = Number(existingDebt.amount) + Number(shareAmount);
      await existingDebt.save({ transaction });
    }

    // Step B: Check REVERSE where user_id=payerId AND owes_user_id=memberId
    const reverseDebt = await Balance.findOne({
      where: { user_id: payerId, owes_user_id: memberId, currency },
      transaction
    });

    if (reverseDebt) {
      const currentReverseAmount = Number(reverseDebt.amount);
      const share = Number(shareAmount);

      if (currentReverseAmount > share) {
        reverseDebt.amount = currentReverseAmount - share;
        await reverseDebt.save({ transaction });
      } else if (currentReverseAmount === share) {
        await reverseDebt.destroy({ transaction });
      } else {
        await reverseDebt.destroy({ transaction });
        await Balance.create({
          user_id: memberId,
          owes_user_id: payerId,
          amount: share - currentReverseAmount,
          currency
        }, { transaction });
      }
      continue;
    }

    // Step C: Neither exists, create new debt
    await Balance.create({
      user_id: memberId,
      owes_user_id: payerId,
      amount: shareAmount,
      currency
    }, { transaction });
  }
};

const updateBalancesOnDelete = async (payerId, memberIds, shareAmount, currency, transaction) => {
  for (const memberId of memberIds) {
    if (memberId === payerId) continue;

    // Step A: Find record where user_id=memberId AND owes_user_id=payerId
    const existingDebt = await Balance.findOne({
      where: { user_id: memberId, owes_user_id: payerId, currency },
      transaction
    });

    if (existingDebt) {
      const currentAmount = Number(existingDebt.amount);
      const share = Number(shareAmount);

      if (currentAmount > share) {
        existingDebt.amount = currentAmount - share;
        await existingDebt.save({ transaction });
      } else if (currentAmount === share) {
        await existingDebt.destroy({ transaction });
      } else {
        await existingDebt.destroy({ transaction });
        await Balance.create({
          user_id: payerId,
          owes_user_id: memberId,
          amount: share - currentAmount,
          currency
        }, { transaction });
      }
      continue;
    }

    // Step B: If not found, check reverse where user_id=payerId AND owes_user_id=memberId
    const reverseDebt = await Balance.findOne({
      where: { user_id: payerId, owes_user_id: memberId, currency },
      transaction
    });

    if (reverseDebt) {
      reverseDebt.amount = Number(reverseDebt.amount) + Number(shareAmount);
      await reverseDebt.save({ transaction });
    } else {
      await Balance.create({
        user_id: payerId,
        owes_user_id: memberId,
        amount: shareAmount,
        currency
      }, { transaction });
    }
  }
};

const getUserBalances = async (userId) => {
  const balances = await Balance.findAll({
    where: {
      [Op.or]: [
        { user_id: userId },
        { owes_user_id: userId }
      ]
    },
    include: [
      { model: User, as: 'debtor', attributes: ['id', 'email'] },
      { model: User, as: 'creditor', attributes: ['id', 'email'] }
    ]
  });

  return balances.map(balance => {
    // If you owe them
    if (balance.user_id === Number(userId)) {
      return {
        balanceId: balance.id,
        withUserId: balance.creditor.id,
        withUserEmail: balance.creditor.email,
        amount: balance.amount,
        currency: balance.currency,
        direction: "you_owe"
      };
    } 
    // If they owe you
    else {
      return {
        balanceId: balance.id,
        withUserId: balance.debtor.id,
        withUserEmail: balance.debtor.email,
        amount: balance.amount,
        currency: balance.currency,
        direction: "owes_you"
      };
    }
  });
};

module.exports = {
  updateBalancesOnAdd,
  updateBalancesOnDelete,
  getUserBalances
};
