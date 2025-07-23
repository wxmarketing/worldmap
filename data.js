// 引入supabase
import { supabase } from './supabase.js';

// 全局国家数据对象（异步加载）
let countryData = {};

// 拉取所有国家数据
export async function loadCountryDataFromSupabase() {
  const { data, error } = await supabase.from('worldmap_data').select('*');
  if (error) {
    console.error('拉取国家数据失败', error);
    return {};
  }
  // 转换为 {country_code: data} 结构
  const result = {};
  data.forEach(row => {
    result[row.country_code] = row.data;
  });
  countryData = result;
  return result;
}

// 保存单个国家数据
export async function saveCountryDataToSupabase(country_code, dataObj) {
  const { error } = await supabase
    .from('worldmap_data')
    .upsert([{ country_code, data: dataObj }]);
  if (error) {
    alert('保存失败: ' + error.message);
    return false;
  }
  // 本地同步
  countryData[country_code] = dataObj;
  return true;
}

// 获取国家数据（兼容原有逻辑）
export function getCountryData(country_code) {
  return countryData[country_code] || null;
}

// 页面加载时调用，拉取数据
export async function initializeCountryData() {
  await loadCountryDataFromSupabase();
}

// 其他原有函数可继续保留，若需用到countryData请确保已异步加载 