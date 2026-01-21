export interface City {
  id: string;
  name: string;
  governorate: string;
}

export const iraqiCities: City[] = [
  // Baghdad Governorate
  { id: 'baghdad', name: 'Baghdad', governorate: 'Baghdad' },
  { id: 'kadhimiyah', name: 'Kadhimiyah', governorate: 'Baghdad' },
  { id: 'sadr-city', name: 'Sadr City', governorate: 'Baghdad' },
  { id: 'adhamiyah', name: 'Adhamiyah', governorate: 'Baghdad' },
  { id: 'karrada', name: 'Karrada', governorate: 'Baghdad' },
  { id: 'mansour', name: 'Mansour', governorate: 'Baghdad' },
  { id: 'abu-ghraib', name: 'Abu Ghraib', governorate: 'Baghdad' },
  
  // Nineveh Governorate
  { id: 'mosul', name: 'Mosul', governorate: 'Nineveh' },
  { id: 'sinjar', name: 'Sinjar', governorate: 'Nineveh' },
  { id: 'tal-afar', name: 'Tal Afar', governorate: 'Nineveh' },
  { id: 'qayyarah', name: 'Qayyarah', governorate: 'Nineveh' },
  { id: 'baashiqah', name: 'Baashiqah', governorate: 'Nineveh' },
  
  // Basra Governorate
  { id: 'basra', name: 'Basra', governorate: 'Basra' },
  { id: 'zubair', name: 'Zubair', governorate: 'Basra' },
  { id: 'qurna', name: 'Qurna', governorate: 'Basra' },
  { id: 'abdan', name: 'Abdan', governorate: 'Basra' },
  { id: 'shatt-al-arab', name: 'Shatt al-Arab', governorate: 'Basra' },
  
  // Erbil Governorate
  { id: 'erbil', name: 'Erbil', governorate: 'Erbil' },
  { id: 'koysanjaq', name: 'Koysanjaq', governorate: 'Erbil' },
  { id: 'rawanduz', name: 'Rawanduz', governorate: 'Erbil' },
  { id: 'shaqlawa', name: 'Shaqlawa', governorate: 'Erbil' },
  
  // Sulaymaniyah Governorate
  { id: 'sulaymaniyah', name: 'Sulaymaniyah', governorate: 'Sulaymaniyah' },
  { id: 'chamchamal', name: 'Chamchamal', governorate: 'Sulaymaniyah' },
  { id: 'kalar', name: 'Kalar', governorate: 'Sulaymaniyah' },
  { id: 'kifri', name: 'Kifri', governorate: 'Sulaymaniyah' },
  
  // Kirkuk Governorate
  { id: 'kirkuk', name: 'Kirkuk', governorate: 'Kirkuk' },
  { id: 'hawija', name: 'Hawija', governorate: 'Kirkuk' },
  { id: 'al-hamdaniya', name: 'Al-Hamdaniya', governorate: 'Kirkuk' },
  
  // Najaf Governorate
  { id: 'najaf', name: 'Najaf', governorate: 'Najaf' },
  { id: 'kufa', name: 'Kufa', governorate: 'Najaf' },
  { id: 'al-manathira', name: 'Al-Manathira', governorate: 'Najaf' },
  
  // Karbala Governorate
  { id: 'karbala', name: 'Karbala', governorate: 'Karbala' },
  { id: 'ain-al-tamr', name: 'Ain al-Tamr', governorate: 'Karbala' },
  { id: 'al-hindiya', name: 'Al-Hindiya', governorate: 'Karbala' },
  
  // Dhi Qar Governorate
  { id: 'nasiriyah', name: 'Nasiriyah', governorate: 'Dhi Qar' },
  { id: 'shatra', name: 'Shatra', governorate: 'Dhi Qar' },
  { id: 'suq-al-shuyukh', name: 'Suq al-Shuyukh', governorate: 'Dhi Qar' },
  { id: 'al-rifai', name: 'Al-Rifai', governorate: 'Dhi Qar' },
  
  // Maysan Governorate
  { id: 'amarah', name: 'Amarah', governorate: 'Maysan' },
  { id: 'al-kahla', name: 'Al-Kahla', governorate: 'Maysan' },
  { id: 'ali-al-gharbi', name: 'Ali al-Gharbi', governorate: 'Maysan' },
  
  // Al-Muthanna Governorate
  { id: 'samawah', name: 'Samawah', governorate: 'Al-Muthanna' },
  { id: 'al-rumaithah', name: 'Al-Rumaithah', governorate: 'Al-Muthanna' },
  { id: 'al-salman', name: 'Al-Salman', governorate: 'Al-Muthanna' },
  
  // Anbar Governorate
  { id: 'ramadi', name: 'Ramadi', governorate: 'Anbar' },
  { id: 'fallujah', name: 'Fallujah', governorate: 'Anbar' },
  { id: 'hit', name: 'Hit', governorate: 'Anbar' },
  { id: 'haditha', name: 'Haditha', governorate: 'Anbar' },
  { id: 'al-qaim', name: 'Al-Qaim', governorate: 'Anbar' },
  { id: 'rutba', name: 'Rutba', governorate: 'Anbar' },
  
  // Halabja Governorate
  { id: 'halabja', name: 'Halabja', governorate: 'Halabja' },
  { id: 'khurmal', name: 'Khurmal', governorate: 'Halabja' },
  
  // Duhok Governorate
  { id: 'duhok', name: 'Duhok', governorate: 'Duhok' },
  { id: 'zakhho', name: 'Zakhho', governorate: 'Duhok' },
  { id: 'sumail', name: 'Sumail', governorate: 'Duhok' },
  { id: 'amadiya', name: 'Amadiya', governorate: 'Duhok' },
  
  // Babil Governorate
  { id: 'hilla', name: 'Hilla', governorate: 'Babil' },
  { id: 'al-mahawil', name: 'Al-Mahawil', governorate: 'Babil' },
  { id: 'al-musayyib', name: 'Al-Musayyib', governorate: 'Babil' },
  { id: 'al-hashimiyah', name: 'Al-Hashimiyah', governorate: 'Babil' },
  
  // Al-Qadisiyah Governorate
  { id: 'diwaniyah', name: 'Diwaniyah', governorate: 'Al-Qadisiyah' },
  { id: 'al-shamiyah', name: 'Al-Shamiyah', governorate: 'Al-Qadisiyah' },
  { id: 'afak', name: 'Afak', governorate: 'Al-Qadisiyah' },
  
  // Saladin Governorate
  { id: 'tikrit', name: 'Tikrit', governorate: 'Saladin' },
  { id: 'samarra', name: 'Samarra', governorate: 'Saladin' },
  { id: 'dhuluiya', name: 'Dhuluiya', governorate: 'Saladin' },
  { id: 'baiji', name: 'Baiji', governorate: 'Saladin' },
  { id: 'balad', name: 'Balad', governorate: 'Saladin' },
  { id: 'al-daur', name: 'Al-Daur', governorate: 'Saladin' },
  
  // Wasit Governorate
  { id: 'kut', name: 'Kut', governorate: 'Wasit' },
  { id: 'al-hay', name: 'Al-Hay', governorate: 'Wasit' },
  { id: 'al-numaniyah', name: 'Al-Numaniyah', governorate: 'Wasit' },
  { id: 'badra', name: 'Badra', governorate: 'Wasit' },
  
  // Diyala Governorate
  { id: 'baqubah', name: 'Baqubah', governorate: 'Diyala' },
  { id: 'khanaqin', name: 'Khanaqin', governorate: 'Diyala' },
  { id: 'muqdadiyah', name: 'Muqdadiyah', governorate: 'Diyala' },
  { id: 'balad-ruz', name: 'Balad Ruz', governorate: 'Diyala' },
  { id: 'khalis', name: 'Khalis', governorate: 'Diyala' },
  { id: 'mandali', name: 'Mandali', governorate: 'Diyala' }
]; 