/**
 * ☁️ SupabaseClient - 초등부 새신자 등록 시스템 Supabase 클라우드 연동 모듈
 */
class SupabaseService {
  constructor() {
    this.storageConfigKey = 'church_supabase_config';
    // 기본 프로젝트 연동 정보 내장
    this.defaultUrl = 'https://jqlftxrdudvbbvhtneng.supabase.co';
    this.defaultAnonKey = 'sb_publishable_qqBehuCiUHRH2Oy1odyiDQ_XOiCgqMj';
    this.client = null;
    this.init();
  }

  getConfig() {
    try {
      const saved = localStorage.getItem(this.storageConfigKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.url && parsed.anonKey) return parsed;
      }
    } catch (e) {
      console.error('Failed to read Supabase config:', e);
    }
    return {
      url: this.defaultUrl,
      anonKey: this.defaultAnonKey
    };
  }

  saveConfig(url, anonKey) {
    const config = {
      url: (url || this.defaultUrl).trim(),
      anonKey: (anonKey || this.defaultAnonKey).trim()
    };
    localStorage.setItem(this.storageConfigKey, JSON.stringify(config));
    this.init();
  }

  init() {
    const { url, anonKey } = this.getConfig();
    if (url && anonKey && window.supabase) {
      try {
        this.client = window.supabase.createClient(url, anonKey);
        console.log('✅ Supabase Client Connected to:', url);
      } catch (e) {
        console.error('Supabase Client Init Error:', e);
        this.client = null;
      }
    } else {
      this.client = null;
    }
  }

  isConfigured() {
    return this.client !== null;
  }

  // Record Data Mapper (Frontend CamelCase <-> Supabase SnakeCase)
  mapToSupabase(record) {
    return {
      id: record.id,
      created_at: new Date().toISOString(),
      child_name: record.childName || '',
      gender: record.gender || '남아',
      birth_date: record.birthDate || '',
      grade: record.grade || '1',
      school_name: record.schoolName || '',
      avatar: record.avatar || '🦁',
      parent_name: record.parentName || '',
      parent_relation: record.parentRelation || '모',
      parent_phone: record.parentPhone || '',
      child_phone: record.childPhone || '',
      address: record.address || '',
      bus_usage: record.busUsage || '직접 등교',
      guide_person: record.guidePerson || '',
      church_exp: record.churchExp || '처음 교회에 옴',
      baptism: record.baptism || '미세례',
      talents: record.talents || [],
      prayer_request: record.prayerRequest || '',
      signature: record.signature || ''
    };
  }

  mapFromSupabase(item) {
    return {
      id: item.id,
      createdAt: item.created_at ? new Date(item.created_at).toLocaleString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      }) : '',
      childName: item.child_name,
      gender: item.gender,
      birthDate: item.birth_date,
      grade: item.grade,
      schoolName: item.school_name,
      avatar: item.avatar,
      parentName: item.parent_name,
      parentRelation: item.parent_relation,
      parentPhone: item.parent_phone,
      childPhone: item.child_phone,
      address: item.address,
      busUsage: item.bus_usage,
      guidePerson: item.guide_person,
      churchExp: item.church_exp,
      baptism: item.baptism,
      talents: item.talents || [],
      prayerRequest: item.prayer_request,
      signature: item.signature
    };
  }

  // 1. 새신자 등록 정보 저장 (INSERT)
  async insertNewcomer(record) {
    if (!this.isConfigured()) {
      return { success: false, offline: true, message: 'Supabase 미설정 (로컬 저장)' };
    }

    try {
      const payload = this.mapToSupabase(record);
      const { data, error } = await this.client
        .from('newcomers')
        .insert([payload])
        .select();

      if (error) {
        console.error('Supabase Insert Error:', error);
        return { success: false, error, message: error.message };
      }

      return { success: true, data };
    } catch (e) {
      console.error('Supabase Insert Exception:', e);
      return { success: false, error: e, message: e.message };
    }
  }

  // 2. 새신자 전체 목록 조회 (SELECT)
  async fetchNewcomers() {
    if (!this.isConfigured()) {
      return { success: false, offline: true, data: [] };
    }

    try {
      const { data, error } = await this.client
        .from('newcomers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Supabase Fetch Error:', error);
        return { success: false, error, data: [] };
      }

      const mapped = (data || []).map((item) => this.mapFromSupabase(item));
      return { success: true, data: mapped };
    } catch (e) {
      console.error('Supabase Fetch Exception:', e);
      return { success: false, error: e, data: [] };
    }
  }

  // 3. 새신자 정보 삭제 (DELETE)
  async deleteNewcomer(id) {
    if (!this.isConfigured()) {
      return { success: false, offline: true };
    }

    try {
      const { error } = await this.client
        .from('newcomers')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Supabase Delete Error:', error);
        return { success: false, error };
      }

      return { success: true };
    } catch (e) {
      console.error('Supabase Delete Exception:', e);
      return { success: false, error: e };
    }
  }
}

window.supabaseService = new SupabaseService();
