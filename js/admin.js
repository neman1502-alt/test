/**
 * 📊 AdminManager - 교사용 관리자 모달, 목록 조회, 필터/검색, Supabase 클라우드 연동, 비밀번호 변경 및 엑셀 내보내기 모듈
 */
class AdminManager {
  constructor(storageKey = 'church_newcomer_records') {
    this.storageKey = storageKey;
    this.pwdStorageKey = 'church_admin_password';
    this.modal = document.getElementById('adminModal');
    this.authModal = document.getElementById('adminAuthModal');
    this.settingsModal = document.getElementById('adminSettingsModal');
    this.tbody = document.getElementById('adminTableBody');
    this.searchInput = document.getElementById('adminSearchInput');
    this.filterTabs = document.querySelectorAll('.tab-btn');
    this.currentGradeFilter = 'all';
    this.defaultAdminPassword = '1234'; // 기본 비밀번호
    this.cachedRecords = [];

    this.bindEvents();
  }

  getAdminPassword() {
    return localStorage.getItem(this.pwdStorageKey) || this.defaultAdminPassword;
  }

  setAdminPassword(newPwd) {
    if (newPwd && newPwd.trim().length > 0) {
      localStorage.setItem(this.pwdStorageKey, newPwd.trim());
      return true;
    }
    return false;
  }

  bindEvents() {
    // 관리자 버튼 클릭 시 인증 팝업
    const triggerBtn = document.getElementById('btnOpenAdmin');
    if (triggerBtn) {
      triggerBtn.addEventListener('click', () => this.openAuth());
    }

    // 모달 닫기 버튼들
    const closeBtns = document.querySelectorAll('.modal-close-btn');
    closeBtns.forEach((btn) => {
      btn.addEventListener('click', () => this.closeAllModals());
    });

    // 인증 폼 제출
    const authForm = document.getElementById('adminAuthForm');
    if (authForm) {
      authForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const pwdInput = document.getElementById('adminPwdInput');
        const currentPwd = this.getAdminPassword();
        if (pwdInput.value === currentPwd) {
          pwdInput.value = '';
          this.closeAllModals();
          this.openDashboard();
        } else {
          alert('비밀번호가 일치하지 않습니다.');
          pwdInput.focus();
        }
      });
    }

    // 설정 모달 열기 버튼
    const btnOpenSettings = document.getElementById('btnOpenDbSettings');
    if (btnOpenSettings) {
      btnOpenSettings.addEventListener('click', () => this.openSettings());
    }

    // 설정 저장 폼 (Supabase 설정 + 관리자 비밀번호 변경)
    const formSettings = document.getElementById('supabaseConfigForm');
    if (formSettings) {
      formSettings.addEventListener('submit', (e) => {
        e.preventDefault();
        const urlInput = document.getElementById('inputSupabaseUrl');
        const keyInput = document.getElementById('inputSupabaseKey');
        const newPwdInput = document.getElementById('inputNewAdminPwd');

        window.supabaseService.saveConfig(urlInput.value, keyInput.value);

        if (newPwdInput && newPwdInput.value.trim().length > 0) {
          this.setAdminPassword(newPwdInput.value.trim());
        }

        alert('설정이 안전하게 저장되었습니다!');
        this.closeAllModals();
        this.openDashboard();
      });
    }

    // 새로고침 버튼
    const btnRefresh = document.getElementById('btnRefreshRecords');
    if (btnRefresh) {
      btnRefresh.addEventListener('click', () => this.loadAndRender());
    }

    // 학년 필터 탭
    this.filterTabs.forEach((tab) => {
      tab.addEventListener('click', (e) => {
        this.filterTabs.forEach((t) => t.classList.remove('active'));
        e.currentTarget.classList.add('active');
        this.currentGradeFilter = e.currentTarget.dataset.grade;
        this.renderTable();
      });
    });

    // 실시간 검색
    if (this.searchInput) {
      this.searchInput.addEventListener('input', () => this.renderTable());
    }

    // 엑셀 다운로드 버튼
    const btnExport = document.getElementById('btnExportExcel');
    if (btnExport) {
      btnExport.addEventListener('click', () => this.exportToCSV());
    }

    // 인쇄 버튼
    const btnPrint = document.getElementById('btnPrintTable');
    if (btnPrint) {
      btnPrint.addEventListener('click', () => window.print());
    }

    // 샘플 데이터 추가 버튼
    const btnSample = document.getElementById('btnAddSampleData');
    if (btnSample) {
      btnSample.addEventListener('click', () => this.addSampleData());
    }
  }

  openAuth() {
    this.closeAllModals();
    if (this.authModal) {
      this.authModal.classList.add('active');
      const pwdInput = document.getElementById('adminPwdInput');
      if (pwdInput) setTimeout(() => pwdInput.focus(), 100);
    }
  }

  openSettings() {
    this.closeAllModals();
    if (this.settingsModal) {
      const config = window.supabaseService.getConfig();
      const urlInput = document.getElementById('inputSupabaseUrl');
      const keyInput = document.getElementById('inputSupabaseKey');
      const newPwdInput = document.getElementById('inputNewAdminPwd');

      if (urlInput) urlInput.value = config.url || '';
      if (keyInput) keyInput.value = config.anonKey || '';
      if (newPwdInput) newPwdInput.value = this.getAdminPassword();

      this.settingsModal.classList.add('active');
    }
  }

  async openDashboard() {
    this.closeAllModals();
    if (this.modal) {
      this.modal.classList.add('active');
      await this.loadAndRender();
    }
  }

  closeAllModals() {
    if (this.modal) this.modal.classList.remove('active');
    if (this.authModal) this.authModal.classList.remove('active');
    if (this.settingsModal) this.settingsModal.classList.remove('active');
  }

  getLocalRecords() {
    try {
      const data = localStorage.getItem(this.storageKey);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Storage Read Error:', e);
      return [];
    }
  }

  saveLocalRecords(records) {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(records));
    } catch (e) {
      console.error('Storage Save Error:', e);
    }
  }

  async loadAndRender() {
    this.updateDbStatusBadge();

    if (window.supabaseService.isConfigured()) {
      const res = await window.supabaseService.fetchNewcomers();
      if (res.success) {
        this.cachedRecords = res.data;
      } else {
        // Fallback to local
        this.cachedRecords = this.getLocalRecords();
      }
    } else {
      this.cachedRecords = this.getLocalRecords();
    }

    this.renderTable();
  }

  updateDbStatusBadge() {
    const badge = document.getElementById('dbStatusBadge');
    if (!badge) return;

    if (window.supabaseService.isConfigured()) {
      badge.innerHTML = '☁️ <span style="color:#10B981; font-weight:700;">Supabase 클라우드 연결됨</span>';
    } else {
      badge.innerHTML = '💾 <span style="color:#F59E0B; font-weight:700;">로컬 저장소 모드 (미연동)</span>';
    }
  }

  renderTable() {
    if (!this.tbody) return;
    const records = this.cachedRecords;
    const query = this.searchInput ? this.searchInput.value.trim().toLowerCase() : '';

    // 필터링 적용
    const filtered = records.filter((item) => {
      const matchGrade = this.currentGradeFilter === 'all' || item.grade === this.currentGradeFilter;
      const matchQuery = !query || 
        (item.childName && item.childName.toLowerCase().includes(query)) ||
        (item.parentName && item.parentName.toLowerCase().includes(query)) ||
        (item.guidePerson && item.guidePerson.toLowerCase().includes(query)) ||
        (item.parentPhone && item.parentPhone.includes(query));
      return matchGrade && matchQuery;
    });

    // 통계 업데이트
    const totalCountEl = document.getElementById('statTotalCount');
    if (totalCountEl) totalCountEl.textContent = records.length;

    const filteredCountEl = document.getElementById('statFilteredCount');
    if (filteredCountEl) filteredCountEl.textContent = filtered.length;

    if (filtered.length === 0) {
      this.tbody.innerHTML = `
        <tr>
          <td colspan="9" style="text-align:center; padding: 40px; color: var(--text-muted);">
            등록된 새신자 데이터가 없습니다.
          </td>
        </tr>
      `;
      return;
    }

    this.tbody.innerHTML = filtered.map((item, idx) => `
      <tr>
        <td>${idx + 1}</td>
        <td><strong>${item.childName || '-'}</strong> (${item.gender || '-'})</td>
        <td><span class="stat-pill" style="padding:2px 8px; font-size:11px;">${item.grade ? item.grade + '학년' : '-'}</span></td>
        <td>${item.birthDate || '-'}</td>
        <td>${item.parentName || '-'} (${item.parentRelation || '보호자'})<br><small style="color:var(--text-muted);">${item.parentPhone || '-'}</small></td>
        <td>${item.guidePerson || '<span style="color:#94A3B8;">스스로 방문</span>'}</td>
        <td>${item.talents && item.talents.length > 0 ? item.talents.join(', ') : '-'}</td>
        <td>
          ${item.signature ? `<img src="${item.signature}" class="signature-thumb" alt="서명">` : '<span style="color:#94A3B8;">확인체크</span>'}
        </td>
        <td>
          <button class="action-btn-sm btn-danger" onclick="adminManager.deleteRecord('${item.id}')">삭제</button>
        </td>
      </tr>
    `).join('');
  }

  async deleteRecord(id) {
    if (!confirm('이 새신자 등록 정보를 삭제하시겠습니까?')) return;

    if (window.supabaseService.isConfigured()) {
      await window.supabaseService.deleteNewcomer(id);
    }

    // Always clean local as well
    const local = this.getLocalRecords().filter((r) => r.id !== id);
    this.saveLocalRecords(local);

    await this.loadAndRender();
  }

  exportToCSV() {
    const records = this.cachedRecords;
    if (records.length === 0) {
      alert('다운로드할 새신자 데이터가 없습니다.');
      return;
    }

    const headers = ['등록번호', '등록일시', '어린이성명', '성별', '생년월일', '학년', '학교명', '보호자성명', '관계', '보호자연락처', '어린이연락처', '주소/지역', '차량탑승', '인도자(전도친구)', '교회출석경험', '세례유무', '달란트/관심사', '기도제목/특이사항'];

    const rows = records.map((r, i) => [
      i + 1,
      r.createdAt || '',
      `"${r.childName || ''}"`,
      `"${r.gender || ''}"`,
      `"${r.birthDate || ''}"`,
      `"${r.grade ? r.grade + '학년' : ''}"`,
      `"${r.schoolName || ''}"`,
      `"${r.parentName || ''}"`,
      `"${r.parentRelation || ''}"`,
      `"${r.parentPhone || ''}"`,
      `"${r.childPhone || ''}"`,
      `"${r.address || ''}"`,
      `"${r.busUsage || ''}"`,
      `"${r.guidePerson || ''}"`,
      `"${r.churchExp || ''}"`,
      `"${r.baptism || ''}"`,
      `"${(r.talents || []).join(';')}"`,
      `"${(r.prayerRequest || '').replace(/"/g, '""')}"`
    ]);

    // CSV 생성 및 한글 깨짐 방지를 위한 UTF-8 BOM(\uFEFF) 추가
    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((row) => row.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const today = new Date().toISOString().slice(0, 10);
    link.setAttribute('href', url);
    link.setAttribute('download', `초등부_새신자등록명단_${today}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  async addSampleData() {
    const sampleRecord = {
      id: 'sample_' + Date.now(),
      createdAt: new Date().toLocaleString('ko-KR'),
      childName: '김예준',
      gender: '남아',
      birthDate: '2016-05-12',
      grade: '4',
      schoolName: '은혜초등학교',
      avatar: '🦁',
      parentName: '김성민',
      parentRelation: '부',
      parentPhone: '010-1234-5678',
      childPhone: '010-9876-5432',
      address: '은혜동 101동',
      busUsage: '이용함 (1호차)',
      guidePerson: '이하은',
      churchExp: '처음 교회에 옴',
      baptism: '유아세례',
      talents: ['찬양', '악기(피아노)'],
      prayerRequest: '선생님과 친구들과 즐겁게 신앙생활 하기를 원해요.',
      signature: ''
    };

    if (window.supabaseService.isConfigured()) {
      await window.supabaseService.insertNewcomer(sampleRecord);
    }

    const current = this.getLocalRecords();
    this.saveLocalRecords([sampleRecord, ...current]);
    await this.loadAndRender();
    alert('체험용 샘플 데이터가 등록되었습니다.');
  }
}

window.AdminManager = AdminManager;
