/**
 * 🌟 ChurchNewcomerApp - 초등부 새신자 등록 메인 애플리케이션 로직
 */
document.addEventListener('DOMContentLoaded', () => {
  // Global Submodules Initialization
  const signaturePad = new SignaturePad('signatureCanvas', 'signaturePlaceholder');
  const confettiAnim = new ConfettiAnimation();
  window.adminManager = new AdminManager('church_newcomer_records');

  // Form State
  let currentStep = 1;
  const totalSteps = 4;

  const formData = {
    childName: '',
    gender: '남아',
    birthDate: '',
    grade: '1',
    schoolName: '',
    avatar: '🦁',
    parentName: '',
    parentRelation: '모',
    parentPhone: '',
    childPhone: '',
    address: '',
    busUsage: '직접 등교',
    guidePerson: '',
    churchExp: '처음 교회에 옴',
    baptism: '미세례',
    talents: [],
    prayerRequest: '',
    agreementAccepted: false,
    signature: ''
  };

  // DOM Elements
  const stepItems = document.querySelectorAll('.step-item');
  const stepContents = document.querySelectorAll('.step-content');
  const progressFill = document.getElementById('stepperProgressFill');
  const btnPrev = document.getElementById('btnPrevStep');
  const btnNext = document.getElementById('btnNextStep');
  const btnSubmit = document.getElementById('btnSubmitForm');
  const btnRestart = document.getElementById('btnRestartRegistration');
  const btnClearSign = document.getElementById('btnClearSignature');

  // Toast Helper
  function showToast(message, icon = '⚠️') {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<span>${icon}</span><span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transition = 'opacity 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 2500);
  }

  // Update Step UI
  function updateStepUI() {
    // Hide all step contents
    stepContents.forEach((content) => {
      content.classList.remove('active');
    });

    // Show current step content
    const currentContent = document.getElementById(`stepContent${currentStep}`);
    if (currentContent) {
      currentContent.classList.add('active');
    }

    // Update Progress Indicator
    const percent = ((currentStep - 1) / (totalSteps - 1)) * 100;
    if (progressFill) progressFill.style.width = `${percent}%`;

    stepItems.forEach((item, index) => {
      const stepNum = index + 1;
      item.classList.remove('active', 'completed');
      if (stepNum === currentStep) {
        item.classList.add('active');
      } else if (stepNum < currentStep) {
        item.classList.add('completed');
      }
    });

    // Button Visibility
    if (btnPrev) {
      btnPrev.style.display = currentStep > 1 && currentStep <= totalSteps ? 'inline-flex' : 'none';
    }

    if (btnNext) {
      btnNext.style.display = currentStep < totalSteps ? 'inline-flex' : 'none';
    }

    if (btnSubmit) {
      btnSubmit.style.display = currentStep === totalSteps ? 'inline-flex' : 'none';
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Validate Specific Step
  function validateCurrentStep() {
    if (currentStep === 1) {
      const nameInput = document.getElementById('inputChildName');
      if (!nameInput.value.trim()) {
        showToast('어린이의 이름을 입력해 주세요.');
        nameInput.focus();
        return false;
      }
      formData.childName = nameInput.value.trim();

      const birthInput = document.getElementById('inputBirthDate');
      if (!birthInput.value) {
        showToast('어린이의 생년월일을 선택해 주세요.');
        birthInput.focus();
        return false;
      }
      formData.birthDate = birthInput.value;
      formData.schoolName = document.getElementById('inputSchoolName').value.trim();
      return true;
    }

    if (currentStep === 2) {
      const pName = document.getElementById('inputParentName');
      if (!pName.value.trim()) {
        showToast('학부모(보호자)의 성함을 입력해 주세요.');
        pName.focus();
        return false;
      }
      formData.parentName = pName.value.trim();

      const pPhone = document.getElementById('inputParentPhone');
      const phoneRegex = /^01[016789]-?\d{3,4}-?\d{4}$/;
      if (!phoneRegex.test(pPhone.value.trim())) {
        showToast('보호자 연락처 번호를 올바르게 입력해 주세요.');
        pPhone.focus();
        return false;
      }
      formData.parentPhone = pPhone.value.trim();
      formData.childPhone = document.getElementById('inputChildPhone').value.trim();
      formData.address = document.getElementById('inputAddress').value.trim();
      return true;
    }

    if (currentStep === 3) {
      formData.guidePerson = document.getElementById('inputGuidePerson').value.trim();
      formData.prayerRequest = document.getElementById('inputPrayerRequest').value.trim();
      return true;
    }

    if (currentStep === 4) {
      const agreeCheck = document.getElementById('checkAgreement');
      if (!agreeCheck.checked) {
        showToast('개인정보 수집 및 이용에 동의해 주세요.');
        agreeCheck.focus();
        return false;
      }
      formData.agreementAccepted = true;

      if (signaturePad.isEmpty()) {
        showToast('학부모(보호자) 확인 서명을 작성해 주세요.');
        return false;
      }
      formData.signature = signaturePad.toDataURL();
      return true;
    }

    return true;
  }

  // Setup Chip Selectors (Single Select)
  function setupSingleChip(groupClass, formKey) {
    const chips = document.querySelectorAll(`.${groupClass}`);
    chips.forEach((chip) => {
      chip.addEventListener('click', () => {
        chips.forEach((c) => c.classList.remove('selected'));
        chip.classList.add('selected');
        formData[formKey] = chip.dataset.value;
      });
    });
  }

  // Setup Multi-Select Chips
  function setupMultiChips(groupClass, formKey) {
    const chips = document.querySelectorAll(`.${groupClass}`);
    chips.forEach((chip) => {
      chip.addEventListener('click', () => {
        chip.classList.toggle('selected');
        const val = chip.dataset.value;
        if (chip.classList.contains('selected')) {
          if (!formData[formKey].includes(val)) formData[formKey].push(val);
        } else {
          formData[formKey] = formData[formKey].filter((item) => item !== val);
        }
      });
    });
  }

  // Setup Avatar Grid
  const avatarItems = document.querySelectorAll('.avatar-item');
  avatarItems.forEach((avatar) => {
    avatar.addEventListener('click', () => {
      avatarItems.forEach((a) => a.classList.remove('selected'));
      avatar.classList.add('selected');
      formData.avatar = avatar.dataset.avatar;
    });
  });

  // Setup Chips Binding
  setupSingleChip('chip-gender', 'gender');
  setupSingleChip('chip-grade', 'grade');
  setupSingleChip('chip-relation', 'parentRelation');
  setupSingleChip('chip-bus', 'busUsage');
  setupSingleChip('chip-church-exp', 'churchExp');
  setupSingleChip('chip-baptism', 'baptism');
  setupMultiChips('chip-talent', 'talents');

  // Phone Auto-Hyphen Formatting
  function formatPhone(input) {
    let val = input.value.replace(/[^0-9]/g, '');
    if (val.length > 3 && val.length <= 7) {
      input.value = val.slice(0, 3) + '-' + val.slice(3);
    } else if (val.length > 7) {
      input.value = val.slice(0, 3) + '-' + val.slice(3, 7) + '-' + val.slice(7, 11);
    } else {
      input.value = val;
    }
  }

  const pPhoneInput = document.getElementById('inputParentPhone');
  if (pPhoneInput) pPhoneInput.addEventListener('input', (e) => formatPhone(e.target));

  const cPhoneInput = document.getElementById('inputChildPhone');
  if (cPhoneInput) cPhoneInput.addEventListener('input', (e) => formatPhone(e.target));

  // Agreement Checkbox Visual Styling
  const agreeCheck = document.getElementById('checkAgreement');
  const agreeLabel = document.getElementById('labelAgreement');
  if (agreeCheck && agreeLabel) {
    agreeCheck.addEventListener('change', () => {
      if (agreeCheck.checked) {
        agreeLabel.classList.add('checked');
      } else {
        agreeLabel.classList.remove('checked');
      }
    });
  }

  // Clear Signature Button
  if (btnClearSign) {
    btnClearSign.addEventListener('click', () => signaturePad.clear());
  }

  // Stepper Header Click
  stepItems.forEach((item) => {
    item.addEventListener('click', (e) => {
      const targetStep = parseInt(e.currentTarget.dataset.step, 10);
      if (targetStep < currentStep) {
        currentStep = targetStep;
        updateStepUI();
      }
    });
  });

  // Next & Previous Buttons
  if (btnNext) {
    btnNext.addEventListener('click', () => {
      if (validateCurrentStep()) {
        currentStep++;
        updateStepUI();
      }
    });
  }

  if (btnPrev) {
    btnPrev.addEventListener('click', () => {
      if (currentStep > 1) {
        currentStep--;
        updateStepUI();
      }
    });
  }

  // Submit Form
  if (btnSubmit) {
    btnSubmit.addEventListener('click', () => {
      if (!validateCurrentStep()) return;

      const record = {
        ...formData,
        id: 'newcomer_' + Date.now(),
        createdAt: new Date().toLocaleString('ko-KR', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit'
        })
      };

      // Save to LocalStorage
      const records = window.adminManager.getRecords();
      records.unshift(record);
      window.adminManager.saveRecords(records);

      // Render Complete Screen
      renderCompleteScreen(record);
    });
  }

  // Render Complete View
  function renderCompleteScreen(record) {
    // Hide form cards and progress
    const formCard = document.querySelector('.form-card');
    const stepperBox = document.querySelector('.stepper-container');
    const heroCard = document.querySelector('.hero-card');

    if (formCard) formCard.style.display = 'none';
    if (stepperBox) stepperBox.style.display = 'none';
    if (heroCard) heroCard.style.display = 'none';

    // Populate Complete Data
    const completeView = document.getElementById('completeViewArea');
    const nameSpan = document.getElementById('completeChildName');
    const avatarSpan = document.getElementById('completeAvatar');

    if (nameSpan) nameSpan.textContent = record.childName;
    if (avatarSpan) avatarSpan.textContent = record.avatar;

    if (completeView) {
      completeView.style.display = 'block';
    }

    // Trigger Confetti Party
    confettiAnim.start(4500);
    showToast('새신자 등록이 은혜 가운데 완료되었습니다! 🎉', '✝️');
  }

  // Restart Registration
  if (btnRestart) {
    btnRestart.addEventListener('click', () => {
      window.location.reload();
    });
  }

  // Initialize
  updateStepUI();
});
