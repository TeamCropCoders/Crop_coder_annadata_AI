export const initialForm = {
  soil: "Loamy",
  location: "Agra, Uttar Pradesh",
  season: "Rabi",
  current_crop: "Wheat"
};

export const languageOptions = [
  { value: "en", label: "English", speech: "en-IN" },
  { value: "hi", label: "हिंदी", speech: "hi-IN" },
  { value: "pa", label: "ਪੰਜਾਬੀ", speech: "pa-IN" }
];

const fieldDefinitions = {
  soil: {
    labels: { en: "Soil Type", hi: "मिट्टी का प्रकार", pa: "ਮਿੱਟੀ ਦੀ ਕਿਸਮ" },
    hints: {
      en: "Type or choose the soil in your preferred language.",
      hi: "अपनी भाषा में मिट्टी का प्रकार लिखें या चुनें।",
      pa: "ਆਪਣੀ ਭਾਸ਼ਾ ਵਿੱਚ ਮਿੱਟੀ ਦੀ ਕਿਸਮ ਲਿਖੋ ਜਾਂ ਚੁਣੋ।"
    },
    prompts: {
      en: "Please say the soil type. For example loamy or black soil.",
      hi: "कृपया मिट्टी का प्रकार बोलें। जैसे दोमट या काली मिट्टी।",
      pa: "ਕਿਰਪਾ ਕਰਕੇ ਮਿੱਟੀ ਦੀ ਕਿਸਮ ਦੱਸੋ। ਜਿਵੇਂ ਦੋਮਟ ਜਾਂ ਕਾਲੀ ਮਿੱਟੀ।"
    },
    options: [
      createOption("Loamy", { en: "Loamy", hi: "दोमट", pa: "ਦੋਮਟ" }, ["loam"]),
      createOption("Black", { en: "Black", hi: "काली", pa: "ਕਾਲੀ" }, ["black soil"]),
      createOption("Red", { en: "Red", hi: "लाल", pa: "ਲਾਲ" }, ["red soil"]),
      createOption("Alluvial", { en: "Alluvial", hi: "जलोढ़", pa: "ਜਲੋੜ" }),
      createOption("Laterite", { en: "Laterite", hi: "लेटराइट", pa: "ਲੇਟਰਾਈਟ" })
    ]
  },
  location: {
    labels: { en: "Location", hi: "स्थान", pa: "ਥਾਂ" },
    hints: {
      en: "Type or speak the district name. The app will match the saved district.",
      hi: "जिले का नाम लिखें या बोलें। ऐप सही जिला चुन लेगा।",
      pa: "ਜ਼ਿਲ੍ਹੇ ਦਾ ਨਾਮ ਲਿਖੋ ਜਾਂ ਬੋਲੋ। ਐਪ ਸਹੀ ਜ਼ਿਲ੍ਹਾ ਚੁਣ ਲਵੇਗੀ।"
    },
    prompts: {
      en: "Please say your district name in Uttar Pradesh.",
      hi: "कृपया उत्तर प्रदेश में अपना जिला बोलें।",
      pa: "ਕਿਰਪਾ ਕਰਕੇ ਉੱਤਰ ਪ੍ਰਦੇਸ਼ ਵਿੱਚ ਆਪਣੇ ਜ਼ਿਲ੍ਹੇ ਦਾ ਨਾਮ ਦੱਸੋ।"
    },
    options: [
      createOption("Agra, Uttar Pradesh", { en: "Agra, Uttar Pradesh", hi: "आगरा, उत्तर प्रदेश", pa: "ਆਗਰਾ, ਉੱਤਰ ਪ੍ਰਦੇਸ਼" }, ["agra", "आगरा", "ਆਗਰਾ"]),
      createOption("Aligarh, Uttar Pradesh", { en: "Aligarh, Uttar Pradesh", hi: "अलीगढ़, उत्तर प्रदेश", pa: "ਅਲੀਗੜ੍ਹ, ਉੱਤਰ ਪ੍ਰਦੇਸ਼" }, ["aligarh", "अलीगढ़", "ਅਲੀਗੜ੍ਹ"]),
      createOption("Allahabad, Uttar Pradesh", { en: "Allahabad, Uttar Pradesh", hi: "इलाहाबाद, उत्तर प्रदेश", pa: "ਅਲਾਹਾਬਾਦ, ਉੱਤਰ ਪ੍ਰਦੇਸ਼" }, ["allahabad", "इलाहाबाद", "ਅਲਾਹਾਬਾਦ", "prayagraj", "प्रयागराज", "ਪ੍ਰਯਾਗਰਾਜ"]),
      createOption("Ambedkar nagar, Uttar Pradesh", { en: "Ambedkar Nagar, Uttar Pradesh", hi: "अंबेडकर नगर, उत्तर प्रदेश", pa: "ਅੰਬੇਡਕਰ ਨਗਰ, ਉੱਤਰ ਪ੍ਰਦੇਸ਼" }, ["ambedkar nagar", "अंबेडकर नगर", "ਅੰਬੇਡਕਰ ਨਗਰ"]),
      createOption("Amethi, Uttar Pradesh", { en: "Amethi, Uttar Pradesh", hi: "अमेठी, उत्तर प्रदेश", pa: "ਅਮੇਠੀ, ਉੱਤਰ ਪ੍ਰਦੇਸ਼" }, ["amethi", "अमेठी", "ਅਮੇਠੀ"]),
      createOption("Amroha, Uttar Pradesh", { en: "Amroha, Uttar Pradesh", hi: "अमरोहा, उत्तर प्रदेश", pa: "ਅਮਰੋਹਾ, ਉੱਤਰ ਪ੍ਰਦੇਸ਼" }, ["amroha", "अमरोहा", "ਅਮਰੋਹਾ"]),
      createOption("Auraiya, Uttar Pradesh", { en: "Auraiya, Uttar Pradesh", hi: "औरैया, उत्तर प्रदेश", pa: "ਔਰੈਆ, ਉੱਤਰ ਪ੍ਰਦੇਸ਼" }, ["auraiya", "औरैया", "ਔਰੈਆ"]),
      createOption("Azamgarh, Uttar Pradesh", { en: "Azamgarh, Uttar Pradesh", hi: "आजमगढ़, उत्तर प्रदेश", pa: "ਆਜ਼ਮਗੜ੍ਹ, ਉੱਤਰ ਪ੍ਰਦੇਸ਼" }, ["azamgarh", "आजमगढ़", "ਆਜ਼ਮਗੜ੍ਹ"]),
      createOption("Baghpat, Uttar Pradesh", { en: "Baghpat, Uttar Pradesh", hi: "बागपत, उत्तर प्रदेश", pa: "ਬਾਗਪਤ, ਉੱਤਰ ਪ੍ਰਦੇਸ਼" }, ["baghpat", "बागपत", "ਬਾਗਪਤ"]),
      createOption("Bahraich, Uttar Pradesh", { en: "Bahraich, Uttar Pradesh", hi: "बहराइच, उत्तर प्रदेश", pa: "ਬਹਿਰਾਈਚ, ਉੱਤਰ ਪ੍ਰਦੇਸ਼" }, ["bahraich", "बहराइच", "ਬਹਿਰਾਈਚ"]),
      createOption("Ballia, Uttar Pradesh", { en: "Ballia, Uttar Pradesh", hi: "बलिया, उत्तर प्रदेश", pa: "ਬਲੀਆ, ਉੱਤਰ ਪ੍ਰਦੇਸ਼" }, ["ballia", "बलिया", "ਬਲੀਆ"]),
      createOption("Banda, Uttar Pradesh", { en: "Banda, Uttar Pradesh", hi: "बांदा, उत्तर प्रदेश", pa: "ਬਾਂਦਾ, ਉੱਤਰ ਪ੍ਰਦੇਸ਼" }, ["banda", "बांदा", "ਬਾਂਦਾ"]),
      createOption("Barabanki, Uttar Pradesh", { en: "Barabanki, Uttar Pradesh", hi: "बाराबंकी, उत्तर प्रदेश", pa: "ਬਾਰਾਬੰਕੀ, ਉੱਤਰ ਪ੍ਰਦੇਸ਼" }, ["barabanki", "बाराबंकी", "ਬਾਰਾਬੰਕੀ"]),
      createOption("Bareilly, Uttar Pradesh", { en: "Bareilly, Uttar Pradesh", hi: "बरेली, उत्तर प्रदेश", pa: "ਬਰੇਲੀ, ਉੱਤਰ ਪ੍ਰਦੇਸ਼" }, ["bareilly", "बरेली", "ਬਰੇਲੀ"]),
      createOption("Basti, Uttar Pradesh", { en: "Basti, Uttar Pradesh", hi: "बस्ती, उत्तर प्रदेश", pa: "ਬਸਤੀ, ਉੱਤਰ ਪ੍ਰਦੇਸ਼" }, ["basti", "बस्ती", "ਬਸਤੀ"]),
      createOption("Bijnor, Uttar Pradesh", { en: "Bijnor, Uttar Pradesh", hi: "बिजनौर, उत्तर प्रदेश", pa: "ਬਿਜਨੌਰ, ਉੱਤਰ ਪ੍ਰਦੇਸ਼" }, ["bijnor", "बिजनौर", "ਬਿਜਨੌਰ"]),
      createOption("Bulandshahr, Uttar Pradesh", { en: "Bulandshahr, Uttar Pradesh", hi: "बुलंदशहर, उत्तर प्रदेश", pa: "ਬੁਲੰਦਸ਼ਹਿਰ, ਉੱਤਰ ਪ੍ਰਦੇਸ਼" }, ["bulandshahr", "बुलंदशहर", "ਬੁਲੰਦਸ਼ਹਿਰ"]),
      createOption("Budaun, Uttar Pradesh", { en: "Budaun, Uttar Pradesh", hi: "बदायूं, उत्तर प्रदेश", pa: "ਬਦਾਯੂੰ, ਉੱਤਰ ਪ੍ਰਦੇਸ਼" }, ["budaun", "बदायूं", "ਬਦਾਯੂੰ"]),
      createOption("Chandauli, Uttar Pradesh", { en: "Chandauli, Uttar Pradesh", hi: "चंदौली, उत्तर प्रदेश", pa: "ਚੰਦੌਲੀ, ਉੱਤਰ ਪ੍ਰਦੇਸ਼" }, ["chandauli", "चंदौली", "ਚੰਦੌਲੀ"]),
      createOption("Chitrakoot, Uttar Pradesh", { en: "Chitrakoot, Uttar Pradesh", hi: "चित्रकूट, उत्तर प्रदेश", pa: "ਚਿਤਰਕੂਟ, ਉੱਤਰ ਪ੍ਰਦੇਸ਼" }, ["chitrakoot", "चित्रकूट", "ਚਿਤਰਕੂਟ"]),
      createOption("Deoria, Uttar Pradesh", { en: "Deoria, Uttar Pradesh", hi: "देवरिया, उत्तर प्रदेश", pa: "ਦੇਵਰਿਆ, ਉੱਤਰ ਪ੍ਰਦੇਸ਼" }, ["deoria", "देवरिया", "ਦੇਵਰਿਆ"]),
      createOption("Etah, Uttar Pradesh", { en: "Etah, Uttar Pradesh", hi: "एटा, उत्तर प्रदेश", pa: "ਏਟਾ, ਉੱਤਰ ਪ੍ਰਦੇਸ਼" }, ["etah", "एटा", "ਏਟਾ"]),
      createOption("Etawah, Uttar Pradesh", { en: "Etawah, Uttar Pradesh", hi: "इटावा, उत्तर प्रदेश", pa: "ਇਟਾਵਾ, ਉੱਤਰ ਪ੍ਰਦੇਸ਼" }, ["etawah", "इटावा", "ਇਟਾਵਾ"]),
      createOption("Faizabad, Uttar Pradesh", { en: "Faizabad, Uttar Pradesh", hi: "फ़ैज़ाबाद, उत्तर प्रदेश", pa: "ਫੈਜ਼ਾਬਾਦ, ਉੱਤਰ ਪ੍ਰਦੇਸ਼" }, ["faizabad", "फ़ैज़ाबाद", "ਫੈਜ਼ਾਬਾਦ", "ayodhya", "अयोध्या", "ਅਯੋਧਿਆ"]),
      createOption("Farrukhabad, Uttar Pradesh", { en: "Farrukhabad, Uttar Pradesh", hi: "फ़र्रुखाबाद, उत्तर प्रदेश", pa: "ਫਰੁੱਖਾਬਾਦ, ਉੱਤਰ ਪ੍ਰਦੇਸ਼" }, ["farrukhabad", "फ़र्रुखाबाद", "ਫਰੁੱਖਾਬਾਦ"]),
      createOption("Fatehpur, Uttar Pradesh", { en: "Fatehpur, Uttar Pradesh", hi: "फतेहपुर, उत्तर प्रदेश", pa: "ਫਤਿਹਪੁਰ, ਉੱਤਰ ਪ੍ਰਦੇਸ਼" }, ["fatehpur", "फतेहपुर", "ਫਤਿਹਪੁਰ"]),
      createOption("Firozabad, Uttar Pradesh", { en: "Firozabad, Uttar Pradesh", hi: "फिरोजाबाद, उत्तर प्रदेश", pa: "ਫਿਰੋਜ਼ਾਬਾਦ, ਉੱਤਰ ਪ੍ਰਦੇਸ਼" }, ["firozabad", "फिरोजाबाद", "ਫਿਰੋਜ਼ਾਬਾਦ"]),
      createOption("Gautam buddha nagar, Uttar Pradesh", { en: "Gautam Buddha Nagar, Uttar Pradesh", hi: "गौतम बुद्ध नगर, उत्तर प्रदेश", pa: "ਗੌਤਮ ਬੁੱਧ ਨਗਰ, ਉੱਤਰ ਪ੍ਰਦੇਸ਼" }, ["gautam buddha nagar", "गौतम बुद्ध नगर", "ਗੌਤਮ ਬੁੱਧ ਨਗਰ", "noida", "नोएडा", "ਨੋਇਡਾ"]),
      createOption("Ghaziabad, Uttar Pradesh", { en: "Ghaziabad, Uttar Pradesh", hi: "गाज़ियाबाद, उत्तर प्रदेश", pa: "ਗਾਜ਼ੀਆਬਾਦ, ਉੱਤਰ ਪ੍ਰਦੇਸ਼" }, ["ghaziabad", "गाज़ियाबाद", "ਗਾਜ਼ੀਆਬਾਦ"]),
      createOption("Ghazipur, Uttar Pradesh", { en: "Ghazipur, Uttar Pradesh", hi: "गाज़ीपुर, उत्तर प्रदेश", pa: "ਗਾਜ਼ੀਪੁਰ, ਉੱਤਰ ਪ੍ਰਦੇਸ਼" }, ["ghazipur", "गाज़ीपुर", "ਗਾਜ਼ੀਪੁਰ"]),
      createOption("Gonda, Uttar Pradesh", { en: "Gonda, Uttar Pradesh", hi: "गोंडा, उत्तर प्रदेश", pa: "ਗੋਂਡਾ, ਉੱਤਰ ਪ੍ਰਦੇਸ਼" }, ["gonda", "गोंडा", "ਗੋਂਡਾ"]),
      createOption("Gorakhpur, Uttar Pradesh", { en: "Gorakhpur, Uttar Pradesh", hi: "गोरखपुर, उत्तर प्रदेश", pa: "ਗੋਰਖਪੁਰ, ਉੱਤਰ ਪ੍ਰਦੇਸ਼" }, ["gorakhpur", "गोरखपुर", "ਗੋਰਖਪੁਰ"]),
      createOption("Hamirpur, Uttar Pradesh", { en: "Hamirpur, Uttar Pradesh", hi: "हमीरपुर, उत्तर प्रदेश", pa: "ਹਮੀਰਪੁਰ, ਉੱਤਰ ਪ੍ਰਦੇਸ਼" }, ["hamirpur", "हमीरपुर", "ਹਮੀਰਪੁਰ"]),
      createOption("Hapur, Uttar Pradesh", { en: "Hapur, Uttar Pradesh", hi: "हापुड़, उत्तर प्रदेश", pa: "ਹਾਪੁੜ, ਉੱਤਰ ਪ੍ਰਦੇਸ਼" }, ["hapur", "हापुड़", "ਹਾਪੁੜ"]),
      createOption("Hardoi, Uttar Pradesh", { en: "Hardoi, Uttar Pradesh", hi: "हरदोई, उत्तर प्रदेश", pa: "ਹਰਦੋਈ, ਉੱਤਰ ਪ੍ਰਦੇਸ਼" }, ["hardoi", "हरदोई", "ਹਰਦੋਈ"]),
      createOption("Hathras, Uttar Pradesh", { en: "Hathras, Uttar Pradesh", hi: "हाथरस, उत्तर प्रदेश", pa: "ਹਾਥਰਸ, ਉੱਤਰ ਪ੍ਰਦੇਸ਼" }, ["hathras", "हाथरस", "ਹਾਥਰਸ"]),
      createOption("Jaunpur, Uttar Pradesh", { en: "Jaunpur, Uttar Pradesh", hi: "जौनपुर, उत्तर प्रदेश", pa: "ਜੌਨਪੁਰ, ਉੱਤਰ ਪ੍ਰਦੇਸ਼" }, ["jaunpur", "जौनपुर", "ਜੌਨਪੁਰ"]),
      createOption("Jalaun, Uttar Pradesh", { en: "Jalaun, Uttar Pradesh", hi: "जालौन, उत्तर प्रदेश", pa: "ਜਾਲੌਨ, ਉੱਤਰ ਪ੍ਰਦੇਸ਼" }, ["jalaun", "जालौन", "ਜਾਲੌਨ"]),
      createOption("Jhansi, Uttar Pradesh", { en: "Jhansi, Uttar Pradesh", hi: "झांसी, उत्तर प्रदेश", pa: "ਝਾਂਸੀ, ਉੱਤਰ ਪ੍ਰਦੇਸ਼" }, ["jhansi", "झांसी", "ਝਾਂਸੀ"]),
      createOption("Kannauj, Uttar Pradesh", { en: "Kannauj, Uttar Pradesh", hi: "कन्नौज, उत्तर प्रदेश", pa: "ਕੰਨੌਜ, ਉੱਤਰ ਪ੍ਰਦੇਸ਼" }, ["kannauj", "कन्नौज", "ਕੰਨੌਜ"]),
      createOption("Kanpur dehat, Uttar Pradesh", { en: "Kanpur Dehat, Uttar Pradesh", hi: "कानपुर देहात, उत्तर प्रदेश", pa: "ਕਾਨਪੁਰ ਦੇਹਾਤ, ਉੱਤਰ ਪ੍ਰਦੇਸ਼" }, ["kanpur dehat", "कानपुर देहात", "ਕਾਨਪੁਰ ਦੇਹਾਤ"]),
      createOption("Kanpur nagar, Uttar Pradesh", { en: "Kanpur Nagar, Uttar Pradesh", hi: "कानपुर नगर, उत्तर प्रदेश", pa: "ਕਾਨਪੁਰ ਨਗਰ, ਉੱਤਰ ਪ੍ਰਦੇਸ਼" }, ["kanpur nagar", "कानपुर नगर", "ਕਾਨਪੁਰ ਨਗਰ", "kanpur", "कानपुर", "ਕਾਨਪੁਰ"]),
      createOption("Kasganj, Uttar Pradesh", { en: "Kasganj, Uttar Pradesh", hi: "कासगंज, उत्तर प्रदेश", pa: "ਕਾਸਗੰਜ, ਉੱਤਰ ਪ੍ਰਦੇਸ਼" }, ["kasganj", "कासगंज", "ਕਾਸਗੰਜ"]),
      createOption("Kaushambi, Uttar Pradesh", { en: "Kaushambi, Uttar Pradesh", hi: "कौशांबी, उत्तर प्रदेश", pa: "ਕੌਸ਼ਾਂਬੀ, ਉੱਤਰ ਪ੍ਰਦੇਸ਼" }, ["kaushambi", "कौशांबी", "ਕੌਸ਼ਾਂਬੀ"]),
      createOption("Kheri, Uttar Pradesh", { en: "Kheri, Uttar Pradesh", hi: "खीरी, उत्तर प्रदेश", pa: "ਖੀਰੀ, ਉੱਤਰ ਪ੍ਰਦੇਸ਼" }, ["kheri", "खीरी", "ਖੀਰੀ", "lakhimpur kheri", "लखीमपुर खीरी", "ਲਖੀਮਪੁਰ ਖੀਰੀ"]),
      createOption("Kushi nagar, Uttar Pradesh", { en: "Kushinagar, Uttar Pradesh", hi: "कुशीनगर, उत्तर प्रदेश", pa: "ਕੁਸ਼ੀਨਗਰ, ਉੱਤਰ ਪ੍ਰਦੇਸ਼" }, ["kushi nagar", "kushinagar", "कुशीनगर", "ਕੁਸ਼ੀਨਗਰ"]),
      createOption("Lalitpur, Uttar Pradesh", { en: "Lalitpur, Uttar Pradesh", hi: "ललितपुर, उत्तर प्रदेश", pa: "ਲਲਿਤਪੁਰ, ਉੱਤਰ ਪ੍ਰਦੇਸ਼" }, ["lalitpur", "ललितपुर", "ਲਲਿਤਪੁਰ"]),
      createOption("Lucknow, Uttar Pradesh", { en: "Lucknow, Uttar Pradesh", hi: "लखनऊ, उत्तर प्रदेश", pa: "ਲਖਨਊ, ਉੱਤਰ ਪ੍ਰਦੇਸ਼" }, ["lucknow", "लखनऊ", "ਲਖਨਊ"]),
      createOption("Maharajganj, Uttar Pradesh", { en: "Maharajganj, Uttar Pradesh", hi: "महराजगंज, उत्तर प्रदेश", pa: "ਮਹਾਰਾਜਗੰਜ, ਉੱਤਰ ਪ੍ਰਦੇਸ਼" }, ["maharajganj", "महराजगंज", "ਮਹਾਰਾਜਗੰਜ"]),
      createOption("Mahoba, Uttar Pradesh", { en: "Mahoba, Uttar Pradesh", hi: "महोबा, उत्तर प्रदेश", pa: "ਮਹੋਬਾ, ਉੱਤਰ ਪ੍ਰਦੇਸ਼" }, ["mahoba", "महोबा", "ਮਹੋਬਾ"]),
      createOption("Mainpuri, Uttar Pradesh", { en: "Mainpuri, Uttar Pradesh", hi: "मैनपुरी, उत्तर प्रदेश", pa: "ਮੈਨਪੁਰੀ, ਉੱਤਰ ਪ੍ਰਦੇਸ਼" }, ["mainpuri", "मैनपुरी", "ਮੈਨਪੁਰੀ"]),
      createOption("Mathura, Uttar Pradesh", { en: "Mathura, Uttar Pradesh", hi: "मथुरा, उत्तर प्रदेश", pa: "ਮਥੁਰਾ, ਉੱਤਰ ਪ੍ਰਦੇਸ਼" }, ["mathura", "मथुरा", "ਮਥੁਰਾ"]),
      createOption("Mau, Uttar Pradesh", { en: "Mau, Uttar Pradesh", hi: "मऊ, उत्तर प्रदेश", pa: "ਮਊ, ਉੱਤਰ ਪ੍ਰਦੇਸ਼" }, ["mau", "मऊ", "ਮਊ"]),
      createOption("Meerut, Uttar Pradesh", { en: "Meerut, Uttar Pradesh", hi: "मेरठ, उत्तर प्रदेश", pa: "ਮੇਰਠ, ਉੱਤਰ ਪ੍ਰਦੇਸ਼" }, ["meerut", "मेरठ", "ਮੇਰਠ"]),
      createOption("Mirzapur, Uttar Pradesh", { en: "Mirzapur, Uttar Pradesh", hi: "मिर्जापुर, उत्तर प्रदेश", pa: "ਮਿਰਜ਼ਾਪੁਰ, ਉੱਤਰ ਪ੍ਰਦੇਸ਼" }, ["mirzapur", "मिर्जापुर", "ਮਿਰਜ਼ਾਪੁਰ"]),
      createOption("Moradabad, Uttar Pradesh", { en: "Moradabad, Uttar Pradesh", hi: "मुरादाबाद, उत्तर प्रदेश", pa: "ਮੁਰਾਦਾਬਾਦ, ਉੱਤਰ ਪ੍ਰਦੇਸ਼" }, ["moradabad", "मुरादाबाद", "ਮੁਰਾਦਾਬਾਦ"]),
      createOption("Muzaffarnagar, Uttar Pradesh", { en: "Muzaffarnagar, Uttar Pradesh", hi: "मुज़फ्फरनगर, उत्तर प्रदेश", pa: "ਮੁਜ਼ਫ਼ਫ਼ਰਨਗਰ, ਉੱਤਰ ਪ੍ਰਦੇਸ਼" }, ["muzaffarnagar", "मुज़फ्फरनगर", "ਮੁਜ਼ਫ਼ਫ਼ਰਨਗਰ"]),
      createOption("Pilibhit, Uttar Pradesh", { en: "Pilibhit, Uttar Pradesh", hi: "पीलीभीत, उत्तर प्रदेश", pa: "ਪੀਲੀਭੀਤ, ਉੱਤਰ ਪ੍ਰਦੇਸ਼" }, ["pilibhit", "पीलीभीत", "ਪੀਲੀਭੀਤ"]),
      createOption("Pratapgarh, Uttar Pradesh", { en: "Pratapgarh, Uttar Pradesh", hi: "प्रतापगढ़, उत्तर प्रदेश", pa: "ਪ੍ਰਤਾਪਗੜ੍ਹ, ਉੱਤਰ ਪ੍ਰਦੇਸ਼" }, ["pratapgarh", "प्रतापगढ़", "ਪ੍ਰਤਾਪਗੜ੍ਹ"]),
      createOption("Rae bareli, Uttar Pradesh", { en: "Rae Bareli, Uttar Pradesh", hi: "रायबरेली, उत्तर प्रदेश", pa: "ਰਾਇਬਰੇਲੀ, ਉੱਤਰ ਪ੍ਰਦੇਸ਼" }, ["rae bareli", "रायबरेली", "ਰਾਇਬਰੇਲੀ"]),
      createOption("Rampur, Uttar Pradesh", { en: "Rampur, Uttar Pradesh", hi: "रामपुर, उत्तर प्रदेश", pa: "ਰਾਮਪੁਰ, ਉੱਤਰ ਪ੍ਰਦੇਸ਼" }, ["rampur", "रामपुर", "ਰਾਮਪੁਰ"]),
      createOption("Saharanpur, Uttar Pradesh", { en: "Saharanpur, Uttar Pradesh", hi: "सहारनपुर, उत्तर प्रदेश", pa: "ਸਹਾਰਨਪੁਰ, ਉੱਤਰ ਪ੍ਰਦੇਸ਼" }, ["saharanpur", "सहारनपुर", "ਸਹਾਰਨਪੁਰ"]),
      createOption("Sambhal, Uttar Pradesh", { en: "Sambhal, Uttar Pradesh", hi: "संभल, उत्तर प्रदेश", pa: "ਸੰਭਲ, ਉੱਤਰ ਪ੍ਰਦੇਸ਼" }, ["sambhal", "संभल", "ਸੰਭਲ"]),
      createOption("Sant kabeer nagar, Uttar Pradesh", { en: "Sant Kabir Nagar, Uttar Pradesh", hi: "संत कबीर नगर, उत्तर प्रदेश", pa: "ਸੰਤ ਕਬੀਰ ਨਗਰ, ਉੱਤਰ ਪ੍ਰਦੇਸ਼" }, ["sant kabir nagar", "संत कबीर नगर", "ਸੰਤ ਕਬੀਰ ਨਗਰ"]),
      createOption("Sant ravidas nagar, Uttar Pradesh", { en: "Sant Ravidas Nagar, Uttar Pradesh", hi: "संत रविदास नगर, उत्तर प्रदेश", pa: "ਸੰਤ ਰਵਿਦਾਸ ਨਗਰ, ਉੱਤਰ ਪ੍ਰਦੇਸ਼" }, ["sant ravidas nagar", "संत रविदास नगर", "ਸੰਤ ਰਵਿਦਾਸ ਨਗਰ", "bhadohi", "भदोही", "ਭਦੋਹੀ"]),
      createOption("Shahjahanpur, Uttar Pradesh", { en: "Shahjahanpur, Uttar Pradesh", hi: "शाहजहांपुर, उत्तर प्रदेश", pa: "ਸ਼ਾਹਜਹਾਂਪੁਰ, ਉੱਤਰ ਪ੍ਰਦੇਸ਼" }, ["shahjahanpur", "शाहजहांपुर", "ਸ਼ਾਹਜਹਾਂਪੁਰ"]),
      createOption("Shamli, Uttar Pradesh", { en: "Shamli, Uttar Pradesh", hi: "शामली, उत्तर प्रदेश", pa: "ਸ਼ਾਮਲੀ, ਉੱਤਰ ਪ੍ਰਦੇਸ਼" }, ["shamli", "शामली", "ਸ਼ਾਮਲੀ"]),
      createOption("Shravasti, Uttar Pradesh", { en: "Shravasti, Uttar Pradesh", hi: "श्रावस्ती, उत्तर प्रदेश", pa: "ਸ਼੍ਰਾਵਸਤੀ, ਉੱਤਰ ਪ੍ਰਦੇਸ਼" }, ["shravasti", "श्रावस्ती", "ਸ਼੍ਰਾਵਸਤੀ"]),
      createOption("Siddharth nagar, Uttar Pradesh", { en: "Siddharth Nagar, Uttar Pradesh", hi: "सिद्धार्थ नगर, उत्तर प्रदेश", pa: "ਸਿੱਧਾਰਥ ਨਗਰ, ਉੱਤਰ ਪ੍ਰਦੇਸ਼" }, ["siddharth nagar", "सिद्धार्थ नगर", "ਸਿੱਧਾਰਥ ਨਗਰ"]),
      createOption("Sitapur, Uttar Pradesh", { en: "Sitapur, Uttar Pradesh", hi: "सीतापुर, उत्तर प्रदेश", pa: "ਸੀਤਾਪੁਰ, ਉੱਤਰ ਪ੍ਰਦੇਸ਼" }, ["sitapur", "सीतापुर", "ਸੀਤਾਪੁਰ"]),
      createOption("Sonbhadra, Uttar Pradesh", { en: "Sonbhadra, Uttar Pradesh", hi: "सोनभद्र, उत्तर प्रदेश", pa: "ਸੋਨਭਦ੍ਰ, ਉੱਤਰ ਪ੍ਰਦੇਸ਼" }, ["sonbhadra", "सोनभद्र", "ਸੋਨਭਦ੍ਰ"]),
      createOption("Sultanpur, Uttar Pradesh", { en: "Sultanpur, Uttar Pradesh", hi: "सुल्तानपुर, उत्तर प्रदेश", pa: "ਸੁਲਤਾਨਪੁਰ, ਉੱਤਰ ਪ੍ਰਦੇਸ਼" }, ["sultanpur", "सुल्तानपुर", "ਸੁਲਤਾਨਪੁਰ"]),
      createOption("Unnao, Uttar Pradesh", { en: "Unnao, Uttar Pradesh", hi: "उन्नाव, उत्तर प्रदेश", pa: "ਉੰਨਾਓ, ਉੱਤਰ ਪ੍ਰਦੇਸ਼" }, ["unnao", "उन्नाव", "ਉੰਨਾਓ"]),
      createOption("Varanasi, Uttar Pradesh", { en: "Varanasi, Uttar Pradesh", hi: "वाराणसी, उत्तर प्रदेश", pa: "ਵਾਰਾਣਸੀ, ਉੱਤਰ ਪ੍ਰਦੇਸ਼" }, ["varanasi", "वाराणसी", "ਵਾਰਾਣਸੀ", "banaras", "बनारस", "ਬਨਾਰਸ"])
    ]
  },
  season: {
    labels: { en: "Season", hi: "मौसम", pa: "ਮੌਸਮ" },
    hints: {
      en: "Speak or type the farming season.",
      hi: "खेती का मौसम बोलें या लिखें।",
      pa: "ਖੇਤੀ ਦਾ ਮੌਸਮ ਦੱਸੋ ਜਾਂ ਲਿਖੋ।"
    },
    prompts: {
      en: "Please say the season. For example rabi or kharif.",
      hi: "कृपया मौसम बोलें। जैसे रबी या खरीफ।",
      pa: "ਕਿਰਪਾ ਕਰਕੇ ਮੌਸਮ ਦੱਸੋ। ਜਿਵੇਂ ਰਬੀ ਜਾਂ ਖਰੀਫ।"
    },
    options: [
      createOption("Rabi", { en: "Rabi", hi: "रबी", pa: "ਰਬੀ" }),
      createOption("Kharif", { en: "Kharif", hi: "खरीफ", pa: "ਖਰੀਫ" })
    ]
  },
  current_crop: {
    labels: { en: "Current Crop", hi: "वर्तमान फसल", pa: "ਮੌਜੂਦਾ ਫਸਲ" },
    hints: {
      en: "Speak or type the crop currently growing on the farm.",
      hi: "खेत में अभी लगी फसल बोलें या लिखें।",
      pa: "ਖੇਤ ਵਿੱਚ ਇਸ ਵੇਲੇ ਲੱਗੀ ਫਸਲ ਦੱਸੋ ਜਾਂ ਲਿਖੋ।"
    },
    prompts: {
      en: "Please say your current crop.",
      hi: "कृपया अपनी वर्तमान फसल बोलें।",
      pa: "ਕਿਰਪਾ ਕਰਕੇ ਆਪਣੀ ਮੌਜੂਦਾ ਫਸਲ ਦੱਸੋ।"
    },
    options: [
      createOption("Wheat", { en: "Wheat", hi: "गेहूं", pa: "ਗੈਂਹੂੰ" }),
      createOption("Rice", { en: "Rice", hi: "धान", pa: "ਧਾਨ" }),
      createOption("Maize", { en: "Maize", hi: "मक्का", pa: "ਮੱਕੀ" }),
      createOption("Gram", { en: "Gram", hi: "चना", pa: "ਚਣਾ" }),
      createOption("Barley", { en: "Barley", hi: "जौ", pa: "ਜੌ" }),
      createOption("Rapeseed &Mustard", { en: "Rapeseed & Mustard", hi: "सरसों", pa: "ਸਰੋਂ" }, ["mustard", "rapeseed mustard", "रेपसीड", "ਮਸਟਰਡ"]),
      createOption("Sugarcane", { en: "Sugarcane", hi: "गन्ना", pa: "ਗੰਨਾ" }),
      createOption("Potato", { en: "Potato", hi: "आलू", pa: "ਆਲੂ" }),
      createOption("Mango", { en: "Mango", hi: "आम", pa: "ਆਮ" }),
      createOption("Banana", { en: "Banana", hi: "केला", pa: "ਕੇਲਾ" }),
      createOption("Cotton", { en: "Cotton", hi: "कपास", pa: "ਕਪਾਹ" }),
      createOption("Groundnut", { en: "Groundnut", hi: "मूंगफली", pa: "ਮੂੰਗਫਲੀ" }, ["peanut", "मूंगफली", "ਮੂੰਗਫਲੀ"])
    ]
  }
};

export const fieldOrder = ["soil", "location", "season", "current_crop"];

export const uiCopy = {
  en: {
    navTagline: "Farmer-first crop intelligence",
    navBadge: "Simple advice for better sowing",
    heroTag: "Smart crop guidance",
    heroTitle: "Choose the crop that gives your farm a stronger tomorrow.",
    heroBody:
      "AnnadataAI compares your current crop with better suggestions using pre-trained models, expected profit, risk, and sustainability rules.",
    formTitle: "Your Crop",
    formBody: "Tell us about your farm conditions.",
    analyze: "Find Best Suggestion",
    analyzing: "Analyzing your farm...",
    readyTitle: "Ready for your first analysis",
    readyBody: "Enter soil, location, season, and your current crop to see the best suggestion.",
    loadingBody: "Checking crop fit, profit, and risk.",
    languageLabel: "Language",
    voiceFill: "Fill Form by Voice",
    voiceField: "Speak",
    voiceUnsupported: "Voice input is not supported in this browser.",
    voiceListening: "Listening for",
    voiceMatched: "Saved",
    voiceRetry: "I could not match that answer. Please try again.",
    voiceDone: "Voice form filling is complete.",
    voiceCancelled: "Voice input stopped before the form was completed.",
    voicePermissionDenied: "Microphone permission is blocked. Please allow microphone access in the browser.",
    voiceNoSpeech: "No speech was detected. Please speak again.",
    voiceError: "Voice input failed. Please try again.",
    formError: "Please choose a valid option for every field before submitting.",
    resultSpeak: "Speak Advice",
    bestSuggestion: "Best Suggestion",
    rank: "Rank",
    compatibility: "Compatibility",
    price: "Price",
    yield: "Yield",
    expectedProfit: "Expected Profit",
    perQuintal: "per quintal",
    tonnesPerHectare: "tonnes/hectare",
    perHectare: "per hectare",
    cropComparison: "Crop Comparison",
    comparisonNote: "Price in INR per quintal, yield in tonnes per hectare, and profit per hectare.",
    crop: "Crop",
    production: "Production",
    risk: "Risk",
    sustainabilityLabel: "Sustainability",
    yourCrop: "Your Crop",
    best: "Best",
    productionIndex: "production index",
    scoreOutOf100: "score / 100",
    sustainabilityNote: "Sustainability Note",
    expectedProfitTitle: "Expected Profit",
    profitShown: "Profit shown in INR per hectare",
    voiceIntro: "Here is your full farm advice.",
    voiceTopCrops: "Top crop suggestions are",
    voiceCurrentCrop: "Your current crop is",
    voiceBestCrop: "The best crop is",
    voiceInsight: "Key insight",
    voiceSustainability: "Sustainability note",
    voicePlay: "Play Advice",
    voicePause: "Pause",
    voiceResume: "Resume",
    mapTitle: "Optional Map Plot",
    mapBody: "Choose state and district, zoom in, and draw a small field plot if the farmer wants to use the map.",
    useMap: "Use Map",
    state: "State",
    district: "District",
    mapDistrictHint: "Selecting a district shifts the map to that area.",
    drawPlot: "Draw Plot",
    drawingPlot: "Drawing Plot...",
    clearPlot: "Clear Plot",
    plotReady: "Plot selected",
    plotEmpty: "No plot selected yet.",
    plotArea: "Approx. area",
    mapLoading: "Loading map location...",
    mapMoved: "Map moved to the selected district.",
    mapUnavailable: "Map location could not be loaded for this district right now."
    ,
    confidence: "Confidence",
    confidenceReason: "Confidence note",
    priceSource: "Price source",
    liveApi: "Live API",
    localSnapshot: "Local snapshot",
    baselinePrice: "Baseline estimate"
  },
  hi: {
    navTagline: "किसान के लिए आसान फसल सलाह",
    navBadge: "बेहतर बुवाई के लिए सरल सलाह",
    heroTag: "स्मार्ट फसल मार्गदर्शन",
    heroTitle: "अपनी खेती के लिए बेहतर कल देने वाली फसल चुनें।",
    heroBody:
      "AnnadataAI आपकी मौजूदा फसल की तुलना बेहतर विकल्पों से करता है और मुनाफा, जोखिम और स्थिरता के आधार पर सलाह देता है।",
    formTitle: "आपकी फसल",
    formBody: "अपनी खेती की जानकारी अपनी भाषा में दें।",
    analyze: "सबसे अच्छा सुझाव देखें",
    analyzing: "आपकी खेती का विश्लेषण हो रहा है...",
    readyTitle: "विश्लेषण के लिए तैयार",
    readyBody: "मिट्टी, स्थान, मौसम और वर्तमान फसल भरें।",
    loadingBody: "फसल उपयुक्तता, मुनाफा और जोखिम देखा जा रहा है।",
    languageLabel: "भाषा",
    voiceFill: "आवाज़ से फॉर्म भरें",
    voiceField: "बोलकर भरें",
    voiceUnsupported: "इस ब्राउज़र में आवाज़ से इनपुट उपलब्ध नहीं है।",
    voiceListening: "सुना जा रहा है",
    voiceMatched: "सहेजा गया",
    voiceRetry: "उत्तर समझ नहीं आया। कृपया फिर से बोलें।",
    voiceDone: "आवाज़ से फॉर्म भरना पूरा हो गया।",
    voiceCancelled: "फॉर्म पूरा होने से पहले आवाज़ इनपुट रुक गया।",
    voicePermissionDenied: "माइक्रोफोन की अनुमति बंद है। कृपया ब्राउज़र में माइक्रोफोन अनुमति दें।",
    voiceNoSpeech: "कोई आवाज़ नहीं मिली। कृपया फिर से बोलें।",
    voiceError: "आवाज़ इनपुट काम नहीं कर रहा। कृपया फिर से कोशिश करें।",
    formError: "सबमिट करने से पहले हर फ़ील्ड के लिए सही विकल्प चुनें।",
    resultSpeak: "सलाह सुनें",
    bestSuggestion: "सबसे अच्छा सुझाव",
    rank: "रैंक",
    compatibility: "अनुकूलता",
    price: "कीमत",
    yield: "उपज",
    expectedProfit: "अपेक्षित मुनाफा",
    perQuintal: "प्रति क्विंटल",
    tonnesPerHectare: "टन/हेक्टेयर",
    perHectare: "प्रति हेक्टेयर",
    cropComparison: "फसल तुलना",
    comparisonNote: "कीमत INR प्रति क्विंटल, उपज टन प्रति हेक्टेयर और मुनाफा प्रति हेक्टेयर में है।",
    crop: "फसल",
    production: "उत्पादन",
    risk: "जोखिम",
    sustainabilityLabel: "स्थिरता",
    yourCrop: "आपकी फसल",
    best: "सबसे अच्छा",
    productionIndex: "उत्पादन सूचकांक",
    scoreOutOf100: "स्कोर / 100",
    sustainabilityNote: "स्थिरता नोट",
    expectedProfitTitle: "अपेक्षित मुनाफा",
    profitShown: "मुनाफा INR प्रति हेक्टेयर में दिखाया गया है",
    voiceIntro: "यह आपकी पूरी खेती सलाह है।",
    voiceTopCrops: "शीर्ष फसल सुझाव हैं",
    voiceCurrentCrop: "आपकी वर्तमान फसल है",
    voiceBestCrop: "सबसे अच्छी फसल है",
    voiceInsight: "मुख्य सलाह",
    voiceSustainability: "स्थिरता नोट",
    voicePlay: "सलाह चलाएं",
    voicePause: "रोकें",
    voiceResume: "फिर चलाएं",
    mapTitle: "वैकल्पिक नक्शा प्लॉट",
    mapBody: "राज्य और जिला चुनें, ज़ूम करें और चाहें तो छोटे खेत का प्लॉट नक्शे पर बनाएं।",
    useMap: "नक्शा इस्तेमाल करें",
    state: "राज्य",
    district: "जिला",
    mapDistrictHint: "जिला चुनने पर नक्शा उसी क्षेत्र पर चला जाएगा।",
    drawPlot: "प्लॉट बनाएं",
    drawingPlot: "प्लॉट बनाया जा रहा है...",
    clearPlot: "प्लॉट हटाएं",
    plotReady: "प्लॉट चुना गया",
    plotEmpty: "अभी कोई प्लॉट नहीं चुना गया है।",
    plotArea: "लगभग क्षेत्रफल",
    mapLoading: "नक्शे का स्थान लोड हो रहा है...",
    mapMoved: "नक्शा चुने गए जिले पर ले जाया गया।",
    mapUnavailable: "अभी इस जिले के लिए नक्शे का स्थान लोड नहीं हो पाया।"
    ,
    confidence: "भरोसा",
    confidenceReason: "भरोसे की जानकारी",
    priceSource: "कीमत का स्रोत",
    liveApi: "लाइव एपीआई",
    localSnapshot: "लोकल स्नैपशॉट",
    baselinePrice: "बेसलाइन अनुमान"
  },
  pa: {
    navTagline: "ਕਿਸਾਨ ਲਈ ਆਸਾਨ ਫਸਲ ਸਲਾਹ",
    navBadge: "ਵਧੀਆ ਬਿਜਾਈ ਲਈ ਸਧਾਰਣ ਸਲਾਹ",
    heroTag: "ਸਮਾਰਟ ਫਸਲ ਮਾਰਗਦਰਸ਼ਨ",
    heroTitle: "ਆਪਣੀ ਖੇਤੀ ਲਈ ਹੋਰ ਚੰਗਾ ਕੱਲ੍ਹ ਦੇਣ ਵਾਲੀ ਫਸਲ ਚੁਣੋ।",
    heroBody:
      "AnnadataAI ਤੁਹਾਡੀ ਮੌਜੂਦਾ ਫਸਲ ਦੀ ਤੁਲਨਾ ਹੋਰ ਚੰਗੇ ਵਿਕਲਪਾਂ ਨਾਲ ਕਰਦਾ ਹੈ ਅਤੇ ਨਫੇ, ਖਤਰੇ ਅਤੇ ਟਿਕਾਊਪਣ ਦੇ ਆਧਾਰ ਤੇ ਸਲਾਹ ਦਿੰਦਾ ਹੈ।",
    formTitle: "ਤੁਹਾਡੀ ਫਸਲ",
    formBody: "ਆਪਣੀ ਖੇਤੀ ਦੀ ਜਾਣਕਾਰੀ ਆਪਣੀ ਭਾਸ਼ਾ ਵਿੱਚ ਦਿਓ।",
    analyze: "ਸਭ ਤੋਂ ਵਧੀਆ ਸੁਝਾਅ ਵੇਖੋ",
    analyzing: "ਤੁਹਾਡੀ ਖੇਤੀ ਦਾ ਵਿਸ਼ਲੇਸ਼ਣ ਹੋ ਰਿਹਾ ਹੈ...",
    readyTitle: "ਵਿਸ਼ਲੇਸ਼ਣ ਲਈ ਤਿਆਰ",
    readyBody: "ਮਿੱਟੀ, ਥਾਂ, ਮੌਸਮ ਅਤੇ ਮੌਜੂਦਾ ਫਸਲ ਭਰੋ।",
    loadingBody: "ਫਸਲ ਸੁਹਾਵਣਪਣ, ਨਫਾ ਅਤੇ ਖਤਰਾ ਵੇਖਿਆ ਜਾ ਰਿਹਾ ਹੈ।",
    languageLabel: "ਭਾਸ਼ਾ",
    voiceFill: "ਆਵਾਜ਼ ਨਾਲ ਫਾਰਮ ਭਰੋ",
    voiceField: "ਬੋਲੋ",
    voiceUnsupported: "ਇਸ ਬ੍ਰਾਊਜ਼ਰ ਵਿੱਚ ਆਵਾਜ਼ ਇਨਪੁੱਟ ਸਹਾਇਤਿਤ ਨਹੀਂ ਹੈ।",
    voiceListening: "ਸੁਣਿਆ ਜਾ ਰਿਹਾ ਹੈ",
    voiceMatched: "ਸੰਭਾਲਿਆ ਗਿਆ",
    voiceRetry: "ਜਵਾਬ ਨਹੀਂ ਮਿਲਿਆ। ਕਿਰਪਾ ਕਰਕੇ ਫਿਰ ਦੱਸੋ।",
    voiceDone: "ਆਵਾਜ਼ ਨਾਲ ਫਾਰਮ ਭਰਨਾ ਪੂਰਾ ਹੋ ਗਿਆ ਹੈ।",
    voiceCancelled: "ਫਾਰਮ ਪੂਰਾ ਹੋਣ ਤੋਂ ਪਹਿਲਾਂ ਆਵਾਜ਼ ਇਨਪੁੱਟ ਰੁਕ ਗਿਆ।",
    voicePermissionDenied: "ਮਾਈਕਰੋਫੋਨ ਦੀ ਇਜਾਜ਼ਤ ਬੰਦ ਹੈ। ਕਿਰਪਾ ਕਰਕੇ ਬ੍ਰਾਊਜ਼ਰ ਵਿੱਚ ਮਾਈਕਰੋਫੋਨ ਦੀ ਇਜਾਜ਼ਤ ਦਿਓ।",
    voiceNoSpeech: "ਕੋਈ ਆਵਾਜ਼ ਨਹੀਂ ਮਿਲੀ। ਕਿਰਪਾ ਕਰਕੇ ਮੁੜ ਬੋਲੋ।",
    voiceError: "ਆਵਾਜ਼ ਇਨਪੁੱਟ ਕੰਮ ਨਹੀਂ ਕਰ ਰਿਹਾ। ਕਿਰਪਾ ਕਰਕੇ ਫਿਰ ਕੋਸ਼ਿਸ਼ ਕਰੋ।",
    formError: "ਸਬਮਿਟ ਕਰਨ ਤੋਂ ਪਹਿਲਾਂ ਹਰ ਖੇਤਰ ਲਈ ਠੀਕ ਵਿਕਲਪ ਚੁਣੋ।",
    resultSpeak: "ਸਲਾਹ ਸੁਣੋ",
    bestSuggestion: "ਸਭ ਤੋਂ ਵਧੀਆ ਸੁਝਾਅ",
    rank: "ਰੈਂਕ",
    compatibility: "ਮਿਲਾਪ",
    price: "ਕੀਮਤ",
    yield: "ਉਪਜ",
    expectedProfit: "ਉਮੀਦਿਤ ਨਫਾ",
    perQuintal: "ਪ੍ਰਤੀ ਕੁਇੰਟਲ",
    tonnesPerHectare: "ਟਨ/ਹੈਕਟੇਅਰ",
    perHectare: "ਪ੍ਰਤੀ ਹੈਕਟੇਅਰ",
    cropComparison: "ਫਸਲ ਤੁਲਨਾ",
    comparisonNote: "ਕੀਮਤ INR ਪ੍ਰਤੀ ਕੁਇੰਟਲ, ਉਪਜ ਟਨ ਪ੍ਰਤੀ ਹੈਕਟੇਅਰ ਅਤੇ ਨਫਾ ਪ੍ਰਤੀ ਹੈਕਟੇਅਰ ਵਿੱਚ ਹੈ।",
    crop: "ਫਸਲ",
    production: "ਉਤਪਾਦਨ",
    risk: "ਖਤਰਾ",
    sustainabilityLabel: "ਟਿਕਾਊਪਣ",
    yourCrop: "ਤੁਹਾਡੀ ਫਸਲ",
    best: "ਸਭ ਤੋਂ ਵਧੀਆ",
    productionIndex: "ਉਤਪਾਦਨ ਸੂਚਕਾਂਕ",
    scoreOutOf100: "ਸਕੋਰ / 100",
    sustainabilityNote: "ਟਿਕਾਊਪਣ ਨੋਟ",
    expectedProfitTitle: "ਉਮੀਦਿਤ ਨਫਾ",
    profitShown: "ਨਫਾ INR ਪ੍ਰਤੀ ਹੈਕਟੇਅਰ ਵਿੱਚ ਦਿਖਾਇਆ ਗਿਆ ਹੈ",
    voiceIntro: "ਇਹ ਤੁਹਾਡੀ ਪੂਰੀ ਖੇਤੀ ਸਲਾਹ ਹੈ।",
    voiceTopCrops: "ਸਭ ਤੋਂ ਵਧੀਆ ਫਸਲ ਸੁਝਾਅ ਹਨ",
    voiceCurrentCrop: "ਤੁਹਾਡੀ ਮੌਜੂਦਾ ਫਸਲ ਹੈ",
    voiceBestCrop: "ਸਭ ਤੋਂ ਵਧੀਆ ਫਸਲ ਹੈ",
    voiceInsight: "ਮੁੱਖ ਸਲਾਹ",
    voiceSustainability: "ਟਿਕਾਊਪਣ ਨੋਟ",
    voicePlay: "ਸਲਾਹ ਚਲਾਓ",
    voicePause: "ਰੋਕੋ",
    voiceResume: "ਮੁੜ ਚਲਾਓ",
    mapTitle: "ਵਿਕਲਪੀ ਨਕਸ਼ਾ ਪਲਾਟ",
    mapBody: "ਰਾਜ ਅਤੇ ਜ਼ਿਲ੍ਹਾ ਚੁਣੋ, ਜ਼ੂਮ ਕਰੋ ਅਤੇ ਚਾਹੋ ਤਾਂ ਛੋਟਾ ਖੇਤ ਪਲਾਟ ਨਕਸ਼ੇ 'ਤੇ ਬਣਾਓ।",
    useMap: "ਨਕਸ਼ਾ ਵਰਤੋ",
    state: "ਰਾਜ",
    district: "ਜ਼ਿਲ੍ਹਾ",
    mapDistrictHint: "ਜ਼ਿਲ੍ਹਾ ਚੁਣਨ ਨਾਲ ਨਕਸ਼ਾ ਉਸੇ ਖੇਤਰ ਤੇ ਚਲਾ ਜਾਵੇਗਾ।",
    drawPlot: "ਪਲਾਟ ਬਣਾਓ",
    drawingPlot: "ਪਲਾਟ ਬਣਾਇਆ ਜਾ ਰਿਹਾ ਹੈ...",
    clearPlot: "ਪਲਾਟ ਹਟਾਓ",
    plotReady: "ਪਲਾਟ ਚੁਣਿਆ ਗਿਆ",
    plotEmpty: "ਹਾਲੇ ਕੋਈ ਪਲਾਟ ਨਹੀਂ ਚੁਣਿਆ ਗਿਆ।",
    plotArea: "ਲਗਭਗ ਖੇਤਰਫਲ",
    mapLoading: "ਨਕਸ਼ੇ ਦੀ ਥਾਂ ਲੋਡ ਹੋ ਰਹੀ ਹੈ...",
    mapMoved: "ਨਕਸ਼ਾ ਚੁਣੇ ਜ਼ਿਲ੍ਹੇ ਉੱਤੇ ਲਿਆਂਦਾ ਗਿਆ।",
    mapUnavailable: "ਇਸ ਜ਼ਿਲ੍ਹੇ ਲਈ ਨਕਸ਼ੇ ਦੀ ਥਾਂ ਹਾਲੇ ਲੋਡ ਨਹੀਂ ਹੋ ਸਕੀ।"
    ,
    confidence: "ਭਰੋਸਾ",
    confidenceReason: "ਭਰੋਸੇ ਬਾਰੇ ਨੋਟ",
    priceSource: "ਕੀਮਤ ਦਾ ਸਰੋਤ",
    liveApi: "ਲਾਈਵ ਏਪੀਆਈ",
    localSnapshot: "ਲੋਕਲ ਸਨੇਪਸ਼ਾਟ",
    baselinePrice: "ਬੇਸਲਾਈਨ ਅਨੁਮਾਨ"
  }
};

export function getUiCopy(language) {
  return uiCopy[language] || uiCopy.en;
}

export function getSpeechLocale(language) {
  return languageOptions.find((option) => option.value === language)?.speech || "en-IN";
}

export function getFieldLabel(field, language) {
  return fieldDefinitions[field]?.labels?.[language] || fieldDefinitions[field]?.labels?.en || field;
}

export function getFieldHint(field, language) {
  return fieldDefinitions[field]?.hints?.[language] || fieldDefinitions[field]?.hints?.en || "";
}

export function getFieldPrompt(field, language) {
  return fieldDefinitions[field]?.prompts?.[language] || fieldDefinitions[field]?.prompts?.en || "";
}

export function getOptionLabel(field, value, language) {
  const option = fieldDefinitions[field]?.options.find((entry) => entry.value === value);
  return option?.labels?.[language] || option?.labels?.en || value;
}

export function getOptionsForField(field, language) {
  return (fieldDefinitions[field]?.options || []).map((option) => ({
    value: option.value,
    label: option.labels[language] || option.labels.en
  }));
}

export function getLocalizedForm(form, language) {
  return Object.fromEntries(
    fieldOrder.map((field) => [field, getOptionLabel(field, form[field], language)])
  );
}

export function getStateOptions(language) {
  return [
    {
      value: "Uttar Pradesh",
      label: getStateLabel("Uttar Pradesh", language)
    }
  ];
}

export function getDistrictOptions(language, state = "Uttar Pradesh") {
  return getOptionsForField("location", language)
    .filter((option) => getStateFromLocation(option.value) === state)
    .map((option) => ({
      value: option.value,
      label: getDistrictLabel(option.value, language)
    }));
}

export function getStateFromLocation(location) {
  return String(location || "").split(",").slice(1).join(",").trim() || "Uttar Pradesh";
}

export function getDistrictLabel(location, language) {
  const localized = getOptionLabel("location", location, language);
  return String(localized).split(",")[0].trim();
}

export function getStateLabel(state, language) {
  if ((state || "").toLowerCase() !== "uttar pradesh") {
    return state;
  }

  if (language === "hi") return "उत्तर प्रदेश";
  if (language === "pa") return "ਉੱਤਰ ਪ੍ਰਦੇਸ਼";
  return "Uttar Pradesh";
}

export function resolveOption(field, input) {
  const normalizedInput = normalizeText(input);
  if (!normalizedInput) {
    return null;
  }

  const options = fieldDefinitions[field]?.options || [];
  const exact = options.find((option) => option.aliases.includes(normalizedInput));
  if (exact) {
    return exact.value;
  }

  const partial = options.find((option) =>
    option.aliases.some(
      (alias) => normalizedInput.includes(alias) || alias.includes(normalizedInput)
    )
  );
  return partial?.value || null;
}

function createOption(value, labels, extraAliases = []) {
  const aliases = new Set([value, labels.en, labels.hi, labels.pa, ...extraAliases]);
  return {
    value,
    labels,
    aliases: Array.from(aliases)
      .map(normalizeText)
      .filter(Boolean)
  };
}

function normalizeText(text) {
  return String(text || "")
    .trim()
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[,&]/g, " ")
    .replace(/[^\p{L}\p{N}\s]/gu, "")
    .replace(/\s+/g, " ");
}
