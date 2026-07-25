const calculateDynamicFeeAmount = (studentFee) => {
  if (!studentFee || !studentFee.feeId) return studentFee ? studentFee.finalAmount : 0;
  
  const fee = studentFee.feeId;
  let finalAmount = studentFee.finalAmount;

  if (studentFee.status === 'PAID') {
    return finalAmount; // Late fees don't accrue after payment
  }

  if (fee.deadlineDate && fee.lateFeeFine > 0) {
    const now = new Date();
    const deadline = new Date(fee.deadlineDate);
    
    // Set both to midnight to compare days accurately
    deadline.setHours(23, 59, 59, 999);

    if (now > deadline) {
      const timeDiff = now.getTime() - deadline.getTime();
      const daysLate = Math.ceil(timeDiff / (1000 * 3600 * 24));
      
      if (fee.lateFeeFineType === 'total') {
        finalAmount += fee.lateFeeFine;
      } else if (fee.lateFeeFineType === 'per day') {
        finalAmount += fee.lateFeeFine * daysLate;
      } else if (fee.lateFeeFineType === 'per month') {
        // Approximate month as 30 days
        const monthsLate = Math.ceil(daysLate / 30);
        finalAmount += fee.lateFeeFine * monthsLate;
      }
    }
  }

  return finalAmount;
};

module.exports = {
  calculateDynamicFeeAmount
};
