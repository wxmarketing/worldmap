// 引入Supabase数据操作方法
import { initializeCountryData, getCountryData, saveCountryDataToSupabase } from './data.js';

let selectedCountryData = null;

// 初始化应用（异步加载云端数据）
async function initApp() {
  // 1. 加载Supabase云端国家数据
  await initializeCountryData();
  console.log("App initialized, 数据已加载");
  // 2. 你可以在这里初始化地图、绑定事件等
  // 例如：initMap();
}

document.addEventListener("DOMContentLoaded", initApp);

// 国家点击事件（获取云端数据）
function onCountryClick(countryName, countryCode) {
  selectedCountryData = getCountryData(countryCode);
  updateCountryDetail(countryName, countryCode, selectedCountryData);
}

// 管理面板保存事件（写入云端）
async function onSaveCountryData(countryCode, newData) {
  const success = await saveCountryDataToSupabase(countryCode, newData);
  if (success) {
    alert('保存成功，所有人都能看到最新数据！');
    // 可选：刷新页面或重新渲染
  }
}

// 你可以将 onCountryClick 绑定到地图点击事件，将 onSaveCountryData 绑定到管理面板保存按钮
// 例如：
// document.getElementById('save-data').addEventListener('click', () => {
//   const countryCode = ... // 获取当前编辑的国家代码
//   const newData = ... // 获取表单中的新数据对象
//   onSaveCountryData(countryCode, newData);
// }); 