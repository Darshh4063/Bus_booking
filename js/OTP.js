function moveToNext(input, index) {
    const inputs = document.querySelectorAll('.otp-input');
    if (input.value && index < inputs.length - 1) {
      inputs[index + 1].focus();
    }
  }

  function moveBack(event, input, index) {
    const inputs = document.querySelectorAll('.otp-input');
    if (event.key === "Backspace" && !input.value && index > 0) {
      inputs[index - 1].focus();
    }
  }

//   function openOtpModal() {
//     var loginModalEl = document.getElementById('loginModal');
//     var otpModal = new bootstrap.Modal(document.getElementById('otpModal'));
  
//     var loginModal = bootstrap.Modal.getInstance(loginModalEl); 
//     if (loginModal) {
//       loginModal.hide();
//     }
  
//     // Ensure modal is fully hidden before showing the next one
//     loginModalEl.addEventListener('hidden.bs.modal', function () {
//       otpModal.show();
//     }, { once: true });
//   }
  

function openOtpModal() {
    var loginModalEl = document.getElementById('loginModal');
    var otpModal = new bootstrap.Modal(document.getElementById('otpModal'));

    var loginModal = bootstrap.Modal.getInstance(loginModalEl); 
    if (loginModal) {
      loginModal.hide();
    }

    // Ensure modal is fully hidden before showing the next one
    loginModalEl.addEventListener('hidden.bs.modal', function () {
      otpModal.show();
    }, { once: true });
  }