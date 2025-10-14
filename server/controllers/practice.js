(() => {
  let OTP = '';
  for (let i = 0; i < 6; i++) {
    let digit = Math.floor(Math.random() * 10);
    OTP += digit;
  }
  console.log(OTP);
})();


