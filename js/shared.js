// 共享JavaScript - Firebase配置
const firebaseConfig = {
    apiKey: "your-api-key",
    authDomain: "your-project.firebaseapp.com",
    projectId: "your-project-id",
    storageBucket: "your-project.appspot.com",
    messagingSenderId: "your-sender-id",
    appId: "your-app-id"
};

// 初始化Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// 用户状态
let currentUser = null;
let userFavorites = new Set();
let allHouses = [];

// 房屋数据
const allHousesData = [
    { name: "陕北窑洞", coords: [109.5, 36.5], climate: "严寒区", temp: 9.5, precip: 495, wall: 800, ratio: 0.08, pitch: 0, scores: {保温: 9,隔热: 8,通风: 4,防潮: 3,采光: 3}, wallMat: "土/石材/砖/土坯", roof: "拱形平顶", courtyard: "四合院/线形", insulation: "厚层黄土覆盖", heatKeep: "厚黄土+拱形结构", ventilation: "门窗对流+高侧孔", moisture: "抬高地基+防潮层", tempRange: "7~12℃", precipRange: "340~650mm", humidity: "66~78%", sunshine: "2400~2700h", desc: "依托黄土层穴居，厚土保温，冬暖夏凉。", period: "pre_qin"},
    { name: "东北大院", coords: [126.5, 45.8], climate: "严寒区", temp: 4.0, precip: 600, wall: 650, ratio: 0.25, pitch: 25, scores: {保温: 8,隔热: 6,通风: 5,防潮: 4,采光: 5}, wallMat: "土坯/青砖/红砖", roof: "硬山两面坡", courtyard: "四合院/口袋房", insulation: "厚墙体", heatKeep: "火炕系统+厚墙", ventilation: "门窗对流+烟道", moisture: "抬高地基+排水", tempRange: "-3.6~9℃", precipRange: "355~881mm", humidity: "50~70%", desc: "合院式，火炕取暖，厚墙防风。", period: "ming_qing"},
    { name: "内蒙古毡房", coords: [116.0, 43.9], climate: "严寒区", temp: 7.0, precip: 400, wall: 50, ratio: 0.05, pitch: 15, scores: {保温: 6,隔热: 5,通风: 7,防潮: 5,采光: 4}, wallMat: "羊毛毡+柳木", roof: "圆形穹顶", courtyard: "无", insulation: "多层毛毡", heatKeep: "火塘+毡围", ventilation: "天窗+掀围毡", moisture: "抬高+排水沟", tempRange: "5~9.9℃", precipRange: "166~647mm", humidity: "50~60%", desc: "穹顶结构，轻便保暖，游牧智慧。", period: "pre_qin"},
    { name: "宁夏回族土坯房", coords: [106.2, 38.4], climate: "严寒区", temp: 7.0, precip: 400, wall: 500, ratio: 0.10, pitch: 15, scores: {保温: 7,隔热: 6,通风: 5,防潮: 6,采光: 5}, wallMat: "土坯/夯土", roof: "平顶/坡顶", courtyard: "三合院/排排房", insulation: "厚土坯墙", heatKeep: "火炕+草泥抹面", ventilation: "门窗对流", moisture: "砖石碱脚+芦苇隔潮", tempRange: "5~9.9℃", precipRange: "166~647mm", desc: "厚土坯蓄热，半地下室降温。", period: "ming_qing"},
    { name: "新疆阿以旺", coords: [79.9, 39.5], climate: "严寒区", temp: 10.0, precip: 80, wall: 650, ratio: 0.10, pitch: 0, scores: {保温: 7,隔热: 7,通风: 6,防潮: 4,采光: 6}, wallMat: "土坯/夯土", roof: "平顶可上人", courtyard: "阿以旺厅", insulation: "厚墙+屋顶覆土", heatKeep: "火墙+阿以旺暖室", ventilation: "天窗拔风", moisture: "抬高地基", tempRange: "8.8~12.2℃", precipRange: "35~150mm", humidity: "40~45%", desc: "中央大厅拔风，厚墙隔热。", period: "wei_jin_tang"},
    { name: "北京四合院", coords: [116.4, 39.9], climate: "寒冷区", temp: 12.0, precip: 650, wall: 500, ratio: 0.18, pitch: 25, scores: {保温: 7,隔热: 6,通风: 5,防潮: 4,采光: 6}, wallMat: "青砖/灰瓦", roof: "硬山卷棚", courtyard: "标准四合院", insulation: "厚墙+游廊", heatKeep: "火炕+双层窗", ventilation: "穿堂风", moisture: "台基+散水", tempRange: "11~13℃", precipRange: "600~700mm", desc: "坐北朝南，庭院采光，防风保温。", period: "ming_qing"},
    { name: "晋中大院", coords: [112.7, 37.7], climate: "寒冷区", temp: 9.0, precip: 470, wall: 600, ratio: 0.15, pitch: 30, scores: {保温: 8,隔热: 6,通风: 5,防潮: 5,采光: 5}, wallMat: "青砖/石材", roof: "硬山高墙", courtyard: "狭长多重院", insulation: "厚外墙", heatKeep: "火炕+锢窑", ventilation: "院落风道", moisture: "砖石碱脚", tempRange: "7.5~11.7℃", precipRange: "400~540mm", desc: "高墙窄院，保温防匪。", period: "ming_qing"},
    { name: "山东海草房", coords: [122.4, 37.2], climate: "寒冷区", temp: 11.5, precip: 850, wall: 850, ratio: 0.12, pitch: 50, scores: {保温: 8,隔热: 8,通风: 6,防潮: 7,采光: 5}, wallMat: "石块/海岩石", roof: "海草顶陡坡", courtyard: "合院", insulation: "厚石墙+海草顶", heatKeep: "厚墙+陡坡", ventilation: "穿堂风", moisture: "陡坡排水+海草防潮", tempRange: "11.3~12℃", precipRange: "800~900mm", desc: "海草顶防雨抗风，厚石墙保温。", period: "ming_qing"},
    { name: "河北平顶房", coords: [114.8, 40.8], climate: "寒冷区", temp: 13.0, precip: 550, wall: 500, ratio: 0.15, pitch: 0, scores: {保温: 6,隔热: 5,通风: 5,防潮: 5,采光: 5}, wallMat: "土坯/砖", roof: "平顶", courtyard: "合院", insulation: "厚墙+覆土", heatKeep: "火炕", ventilation: "门窗对流", moisture: "散水", tempRange: "11~15℃", precipRange: "300~800mm", desc: "平顶晾晒，火炕取暖。", period: "ming_qing"},
    { name: "陕西关中民居", coords: [108.9, 34.3], climate: "寒冷区", temp: 9.0, precip: 650, wall: 240, ratio: 0.18, pitch: 30, scores: {保温: 5,隔热: 5,通风: 6,防潮: 5,采光: 6}, wallMat: "空心砖/土坯", roof: "硬山坡顶", courtyard: "合院", insulation: "240墙", heatKeep: "火炕", ventilation: "天井拔风", moisture: "砖石碱脚", tempRange: "6~13.6℃", precipRange: "500~800mm", desc: "合院布局，采光保温。", period: "ming_qing"},
    { name: "徽派建筑", coords: [118.3, 29.7], climate: "夏热冬冷区", temp: 12.0, precip: 1900, wall: 250, ratio: 0.25, pitch: 25, scores: {保温: 5,隔热: 7,通风: 8,防潮: 6,采光: 8}, wallMat: "小青砖/白灰", roof: "坡顶马头墙", courtyard: "天井式", insulation: "马头墙遮阳", heatKeep: "厚墙+天井", ventilation: "天井烟囱效应", moisture: "四水归堂", tempRange: "7.8~17℃", precipRange: "1470~2400mm", humidity: "75~85%", desc: "天井拔风，马头墙防火遮阳。", period: "song_yuan"},
    { name: "江南天井院", coords: [120.5, 31.0], climate: "夏热冬冷区", temp: 15.5, precip: 1250, wall: 270, ratio: 0.22, pitch: 20, scores: {保温: 5,隔热: 6,通风: 8,防潮: 7,采光: 7}, wallMat: "砖木", roof: "坡顶", courtyard: "天井", insulation: "高墙遮阳", heatKeep: "厚墙", ventilation: "天井拔风", moisture: "青石板排水", tempRange: "15~16.5℃", precipRange: "1000~1500mm", desc: "小天井通风采光，四周高墙。", period: "song_yuan"},
    { name: "川西林盘", coords: [104.0, 30.6], climate: "夏热冬冷区", temp: 17.0, precip: 950, wall: 200, ratio: 0.20, pitch: 20, scores: {保温: 4,隔热: 5,通风: 9,防潮: 6,采光: 6}, wallMat: "木/砖木", roof: "小青瓦", courtyard: "林盘聚落", insulation: "高大林木", heatKeep: "低层建筑", ventilation: "林木拔风", moisture: "水系环绕", tempRange: "16~18℃", precipRange: "900~1000mm", desc: "林盘调节微气候，水系降温。", period: "ming_qing"},
    { name: "湖南吊脚楼", coords: [109.7, 28.3], climate: "夏热冬冷区", temp: 17.0, precip: 1370, wall: 100, ratio: 0.10, pitch: 25, scores: {保温: 4,隔热: 5,通风: 8,防潮: 8,采光: 5}, wallMat: "杉木", roof: "坡顶青瓦", courtyard: "无", insulation: "底层架空", heatKeep: "火塘", ventilation: "底层通风", moisture: "干栏架空", tempRange: "16.3~17.9℃", precipRange: "1240~1500mm", desc: "干栏式，防潮防虫，通风极佳。", period: "pre_qin"},
    { name: "湖北天井房", coords: [114.3, 30.6], climate: "夏热冬冷区", temp: 16.0, precip: 1200, wall: 300, ratio: 0.20, pitch: 25, scores: {保温: 6,隔热: 6,通风: 7,防潮: 6,采光: 7}, wallMat: "砖木", roof: "坡顶", courtyard: "天井合院", insulation: "厚墙", heatKeep: "厚墙+天井", ventilation: "天井拔风", moisture: "排水系统", tempRange: "15.9~16.6℃", precipRange: "1100~1300mm", desc: "天井组织通风排水。", period: "ming_qing"},
    { name: "福建土楼", coords: [117.0, 24.7], climate: "夏热冬暖区", temp: 18.5, precip: 1490, wall: 1000, ratio: 0.10, pitch: 25, scores: {保温: 8,隔热: 8,通风: 6,防潮: 7,采光: 4}, wallMat: "三合土夯筑", roof: "青瓦坡顶", courtyard: "环形内通廊", insulation: "厚土墙", heatKeep: "厚墙+聚族", ventilation: "环形通廊", moisture: "出檐深远", tempRange: "17.8~19.5℃", precipRange: "1480~1500mm", desc: "巨型土楼，厚墙隔热防风，环形防御。", period: "ming_qing"},
    { name: "广东镬耳屋", coords: [113.1, 23.0], climate: "夏热冬暖区", temp: 22.0, precip: 1575, wall: 300, ratio: 0.20, pitch: 25, scores: {保温: 5,隔热: 7,通风: 7,防潮: 6,采光: 6}, wallMat: "青砖/麻石", roof: "坡顶镬耳山墙", courtyard: "梳式布局", insulation: "镬耳遮阳", heatKeep: "砖墙", ventilation: "山墙导风", moisture: "天井排水", tempRange: "21~23℃", precipRange: "1430~1720mm", desc: "镬耳山墙挡风引风，适应湿热。", period: "ming_qing"},
    { name: "云南一颗印", coords: [102.7, 25.0], climate: "夏热冬暖区", temp: 16.0, precip: 950, wall: 500, ratio: 0.08, pitch: 25, scores: {保温: 6,隔热: 7,通风: 6,防潮: 7,采光: 5}, wallMat: "夯土/土坯", roof: "坡顶小青瓦", courtyard: "三间四耳", insulation: "厚土墙", heatKeep: "厚墙+小天井", ventilation: "天井烟囱", moisture: "四水归堂", tempRange: "14~18℃", precipRange: "887~1031mm", desc: "厚墙小窗，防风防晒，天井排水。", period: "ming_qing"},
    { name: "广西干栏式", coords: [110.2, 25.2], climate: "夏热冬暖区", temp: 20.0, precip: 1750, wall: 100, ratio: 0.15, pitch: 25, scores: {保温: 4,隔热: 5,通风: 9,防潮: 8,采光: 5}, wallMat: "杉木/松木", roof: "坡顶", courtyard: "无", insulation: "底层架空", heatKeep: "火塘", ventilation: "全架空通风", moisture: "干栏防潮", tempRange: "16.5~23.1℃", precipRange: "1500~2000mm", desc: "干栏式极致通风防潮，适应湿热山区。", period: "pre_qin"},
    { name: "海南火山石屋", coords: [110.3, 20.0], climate: "夏热冬暖区", temp: 24.0, precip: 1865, wall: 500, ratio: 0.10, pitch: 30, scores: {保温: 7,隔热: 8,通风: 6,防潮: 7,采光: 5}, wallMat: "火山石", roof: "坡顶", courtyard: "合院", insulation: "厚石墙", heatKeep: "厚石", ventilation: "门窗对流", moisture: "石材防潮", tempRange: "23.8~24.4℃", precipRange: "1660~2070mm", desc: "火山石隔热，适应高温高湿。", period: "ming_qing"},
    { name: "傣族竹楼", coords: [100.8, 22.0], climate: "温和区", temp: 21.0, precip: 1250, wall: 80, ratio: 0.15, pitch: 25, scores: {保温: 4,隔热: 5,通风: 8,防潮: 8,采光: 6}, wallMat: "竹子/木材", roof: "人字形坡顶", courtyard: "无", insulation: "架空+竹木", heatKeep: "火塘", ventilation: "全通风", moisture: "底层高架空", tempRange: "19.5~22.4℃", precipRange: "1070~1426mm", desc: "竹楼架空，通风防潮，热带智慧。", period: "pre_qin"},
    { name: "白族三坊一照壁", coords: [100.2, 25.6], climate: "温和区", temp: 15.0, precip: 1080, wall: 400, ratio: 0.20, pitch: 27, scores: {保温: 6,隔热: 6,通风: 7,防潮: 6,采光: 7}, wallMat: "砖石/土坯", roof: "硬山坡顶", courtyard: "三坊照壁", insulation: "厚墙", heatKeep: "火塘+日照", ventilation: "院落通风", moisture: "青石板排水", tempRange: "14.9~15.1℃", precip: "1080mm", desc: "照壁反射阳光，防风聚气。", period: "ming_qing"},
    { name: "纳西族民居", coords: [100.2, 26.8], climate: "温和区", temp: 13.5, precip: 970, wall: 500, ratio: 0.20, pitch: 25, scores: {保温: 6,隔热: 6,通风: 7,防潮: 6,采光: 7}, wallMat: "土坯/砖石", roof: "悬山青瓦", courtyard: "三坊一照壁", insulation: "厚墙+深出檐", heatKeep: "厚墙+火塘", ventilation: "厦子通风", moisture: "毛石防潮", tempRange: "12.6~14.5℃", precipRange: "940~1000mm", desc: "深出檐遮阳，厚墙保温。", period: "ming_qing"},
    { name: "藏族碉房", coords: [91.1, 29.6], climate: "温和区", temp: 5.0, precip: 500, wall: 600, ratio: 0.10, pitch: 0, scores: {保温: 9,隔热: 8,通风: 5,防潮: 6,采光: 4}, wallMat: "石块/夯土", roof: "平顶", courtyard: "无/碉院", insulation: "厚石墙", heatKeep: "厚墙+火塘", ventilation: "门窗+烟道", moisture: "石基防潮", tempRange: "-4.4~14.2℃", precipRange: "262~772mm", desc: "石砌厚墙，平顶保暖抗风。", period: "song_yuan"},
    { name: "羌族碉楼", coords: [103.5, 31.9], climate: "温和区", temp: 2.2, precip: 318, wall: 1500, ratio: 0.08, pitch: 0, scores: {保温: 9,隔热: 9,通风: 5,防潮: 6,采光: 4}, wallMat: "石片/黄泥", roof: "平顶", courtyard: "无", insulation: "巨厚石墙", heatKeep: "厚墙+火塘", ventilation: "窄窗+甬道", moisture: "深基防潮", tempRange: "2.2℃(年均)", precip: "318mm", desc: "石墙极厚，冬暖夏凉，防御为主。", period: "song_yuan"},
    { name: "江西天井院", coords: [115.858197, 28.682637], climate: "夏热冬冷区", temp: 16.0, precip: 1450, wall: 400, ratio: 0.3, pitch: 30, scores: {保温: 7,隔热: 6,通风: 8,防潮: 7,采光: 7}, wallMat: "青砖、马头墙（下部砖石，上部青砖）", roof: "坡屋顶（硬山式），小青瓦覆盖，马头墙高出", courtyard: "小天井式（天井面积5-15㎡），四水归堂", insulation: "高屋顶、小天井通风、白灰墙面反射太阳辐射", heatKeep: "厚墙体、封闭天井（冬季）、室内火塘", ventilation: "天井拔风（烟囱效应）+门窗对流，夏季主导", moisture: "抬高地基、地面铺设青石板、天井排水系统", tempRange: "15.0~17.0℃", precipRange: "1300~1600mm", humidity: "75~85%", desc: "江西天井院，多坐北朝南，部分根据地形调整。", period: "ming_qing"},
    { name: "浙江乌篷船屋", coords: [120.585316, 30.06307], climate: "夏热冬冷区", temp: 16.5, precip: 1350, wall: 325, ratio: 0.35, pitch: 35, scores: {保温: 5,隔热: 6,通风: 8,防潮: 7,采光: 7}, wallMat: "竹木框架、芦苇墙、外墙抹灰", roof: "坡屋顶（悬山式），茅草或小青瓦覆盖", courtyard: "临水而建，无独立院落，门前设石阶", insulation: "高屋顶、竹木材料隔热、临水降温", heatKeep: "冬季增加芦苇墙厚度、室内火盆", ventilation: "门窗对流、河道穿堂风，夏季主导通风", moisture: "高架地板（离水面0.5-1m）、芦苇墙防", tempRange: "15.5~17.5℃", precipRange: "1200~1500mm", humidity: "78~88%", desc: "浙江乌篷船屋，多平行于河道，部分坐北朝南。", period: "ming_qing"},
    { name: "甘肃土坯房", coords: [103.823557, 36.058039], climate: "寒冷区", temp: 8.0, precip: 450, wall: 650, ratio: 0.2, pitch: 20, scores: {保温: 8,隔热: 8,通风: 7,防潮: 5,采光: 6}, wallMat: "土坯（黄土+麦草）、部分砖石地基", roof: "平顶（少量坡屋顶），可晾晒粮食", courtyard: "四合院或三合院，封闭性强", insulation: "厚墙体、小窗、室内遮阳", heatKeep: "厚土坯墙、封闭院落、火炕/火墙", ventilation: "夏季门窗对流，冬季少通风", moisture: "抬高地基、地面夯实、屋顶防水处理", tempRange: "6.0~10.0℃", precipRange: "300~600mm", humidity: "50~65%", desc: "甘肃土坯房，坐北朝南，背风向阳。", period: "ming_qing"},
    { name: "青海庄廓院", coords: [101.778916, 36.623178], climate: "严寒区", temp: 4.5, precip: 400, wall: 800, ratio: 0.15, pitch: 15, scores: {保温: 8,隔热: 8,通风: 5,防潮: 6,采光: 6}, wallMat: "黄土夯筑、部分砖石包边", roof: "平顶（少量坡屋顶），设女儿墙", courtyard: "正方形四合院，封闭性极强，高墙围合", insulation: "厚墙体、小窗、屋顶覆土", heatKeep: "超厚夯土墙、封闭院落、火炕/煨炕", ventilation: "夏季短暂门窗对流，冬季完全封闭", moisture: "高地基（0.5-1m）、地面铺砂石、屋顶", tempRange: "2.0~7.0℃", precipRange: "300~500mm", humidity: "45~60%", desc: "青海庄廓院，坐北朝南，严格背风向阳。", period: "ming_qing"},
    { name: "内蒙古蒙古包", coords: [116.683546, 43.973207], climate: "严寒区", temp: 4.0, precip: 275, wall: 75, ratio: 0.12, pitch: 35, scores: {保温: 4,隔热: 5,通风: 5,防潮: 6,采光: 4}, wallMat: "羊毛毡（外层）、帆布（内层）、木架（哈那", roof: "圆形穹顶（天窗），羊毛毡覆盖", courtyard: "无固定院落，游牧式布局", insulation: "羊毛毡隔热，夏季减少层数", heatKeep: "多层羊毛毡、封闭天窗、火塘取暖", ventilation: "夏季掀开底部毡帘+天窗通风，冬季仅天窗微", moisture: "地面铺毛毡、垫木，避免直接接触草地", tempRange: "-2.0~6.0℃", precipRange: "150~400mm", humidity: "40~60%", desc: "内蒙古蒙古包，门朝南或东南，避开冬季西北风。", period: "ming_qing"},
    { name: "海南船型屋", coords: [109.501829, 18.967372], climate: "夏热冬暖区", temp: 24.5, precip: 1750, wall: 224, ratio: 0.3, pitch: 45, scores: {保温: 5,隔热: 5,通风: 8,防潮: 7,采光: 7}, wallMat: "竹木框架、茅草墙、茅草屋顶", roof: "船型坡屋顶（悬山式），茅草覆盖", courtyard: "无固定院落，游牧式布局，包外用柳条或树枝", insulation: "茅草屋顶隔热、高屋顶、通风良好", heatKeep: "多层羊毛毡、封闭天窗、地面铺厚毡、火塘全", ventilation: "夏季掀底部毡帘+天窗形成对流，冬季仅天窗", moisture: "地面铺多层毛毡、垫木，避免直接接触草地湿", tempRange: "23.0~26.0℃", precipRange: "1500~2000mm", humidity: "80~90%", desc: "海南船型屋，多沿等高线，部分坐北朝南。", period: "ming_qing"},
    { name: "四川竹楼", coords: [104.065735, 30.572806], climate: "夏热冬冷区", temp: 17.0, precip: 1200, wall: 150, ratio: 0.45, pitch: 40, scores: {保温: 4,隔热: 5,通风: 8,防潮: 7,采光: 7}, wallMat: "全竹结构（竹柱、竹梁、竹墙、竹屋顶）", roof: "坡屋顶（悬山式），竹篾+茅草覆盖", courtyard: "依山而建，无固定院落，底层架空", insulation: "竹材隔热、高架结构、通风良好", heatKeep: "冬季增加竹墙厚度、室内火塘", ventilation: "门窗对流、穿堂风，夏季主导", moisture: "高架底层（1.5-3m）、竹材防腐处理", tempRange: "16.0~18.0℃", precipRange: "1000~1400mm", humidity: "75~85%", desc: "四川竹楼，坐北朝南，适应山地地形。", period: "ming_qing"},
    { name: "广西干栏式民居", coords: [108.3167, 22.82402], climate: "夏热冬暖区", temp: 21.5, precip: 1500, wall: 224, ratio: 0.4, pitch: 45, scores: {保温: 5,隔热: 5,通风: 8,防潮: 7,采光: 7}, wallMat: "竹木框架、木板墙、茅草/瓦屋顶", roof: "坡屋顶（悬山式），小青瓦或茅草覆盖", courtyard: "多户聚居，无固定院落，底层架空", insulation: "高屋顶、竹木材料、通风良好", heatKeep: "无需保温，冬季温和", ventilation: "门窗对流、穿堂风，全年主导", moisture: "高架底层（1-2m）、木板防潮处理", tempRange: "20.0~23.0℃", precipRange: "1200~1800mm", humidity: "80~90%", desc: "广西干栏式民居，坐北朝南，适应丘陵地形。", period: "ming_qing"},
    { name: "陕西韩城党家村四合院", coords: [110.477899, 35.460657], climate: "寒冷区", temp: 14.0, precip: 600, wall: 500, ratio: 0.25, pitch: 25, scores: {保温: 7,隔热: 8,通风: 7,防潮: 5,采光: 7}, wallMat: "砖木混合（青砖、木材、少量石材）", roof: "坡屋顶（硬山式），小青瓦覆盖，有脊兽", courtyard: "标准四合院（一进或多进），中轴线对称", insulation: "厚墙体、小窗、屋顶通风", heatKeep: "厚砖墙、封闭院落、火炕/火墙", ventilation: "夏季门窗对流+天井通风，冬季少通风", moisture: "高地基、地面铺青砖、排水系统", tempRange: "13.0~15.0℃", precipRange: "500~700mm", humidity: "60~75%", desc: "陕西韩城党家村四合院，严格坐北朝南，中轴线对称。", period: "ming_qing"},
    { name: "安徽宏村民居", coords: [118.179646, 29.874637], climate: "夏热冬冷区", temp: 16.0, precip: 1650, wall: 400, ratio: 0.3, pitch: 30, scores: {保温: 7,隔热: 6,通风: 8,防潮: 7,采光: 7}, wallMat: "砖木混合（青砖、木材、白灰墙面）", roof: "坡屋顶（硬山式），小青瓦覆盖，马头墙", courtyard: "天井式四合院，四水归堂", insulation: "白灰墙面反射、天井通风、水系调节", heatKeep: "厚墙体、封闭天井、室内火塘", ventilation: "天井拔风+门窗对流，夏季主导", moisture: "高地基、地面铺石板、水系排水", tempRange: "15.0~17.0℃", precipRange: "1500~1800mm", humidity: "75~85%", desc: "安徽宏村民居，坐北朝南，结合水系布局。", period: "ming_qing"},
    { name: "苏州园林式民居", coords: [120.619522, 31.326013], climate: "夏热冬冷区", temp: 16.0, precip: 1100, wall: 400, ratio: 0.35, pitch: 35, scores: {保温: 7,隔热: 6,通风: 8,防潮: 7,采光: 7}, wallMat: "青砖、黛瓦、木材、太湖石、砖雕、木雕、石", roof: "硬山式、歇山式、卷棚式等多种形式，配合园", courtyard: "园林式布局，讲究移步换景，由多个庭院", insulation: "1.茂密植被遮阳2.水体调节温度3.高大", heatKeep: "1.厚青砖墙体2.双层门窗3.室内设火盆", ventilation: "1.穿堂风（门窗对流）2.园林空间引导自", moisture: "1.抬高地基（约0.3-0.5米）2.砖", tempRange: "15.0~17.0℃", precipRange: "1000~1200mm", humidity: "75~85%", desc: "苏州园林式民居，主体建筑多坐北朝南，园林部分灵活布局。", period: "ming_qing"},
    { name: "西藏碉房", coords: [98.277334, 30.865967], climate: "严寒区", temp: 5.8, precip: 540, wall: 1350, ratio: 0.15, pitch: 20, scores: {保温: 8,隔热: 8,通风: 5,防潮: 6,采光: 6}, wallMat: "本地夯土、土坯", roof: "平顶，顶部设置经幡台", courtyard: "无独立院落，碉房群依山而建，通过共用山墙", insulation: "厚土墙隔绝外部高温", heatKeep: "厚土墙蓄热保暖；底层饲养牲畜，利用动物体", ventilation: "门窗对流通风，设置风门、天窗等方式进行通", moisture: "底层架空/饲养牲畜减少地面湿气；地面铺设", tempRange: "5.2~6.3℃", precipRange: "480~600mm", humidity: "40~55%", desc: "西藏碉房，无固定朝向，多依山而建，呈城堡式布局。", period: "ming_qing"},
    { name: "广东开平碉楼", coords: [112.625157, 22.361333], climate: "夏热冬暖区", temp: 22.0, precip: 1950, wall: 93, ratio: 0.15, pitch: 25, scores: {保温: 4,隔热: 5,通风: 5,防潮: 7,采光: 6}, wallMat: "红砖、青砖、钢筋混凝土、石材、夯土等多类", roof: "硬山顶式", courtyard: "点状独立建筑，无围合院落", insulation: "双层隔热屋顶设计，有效散热通风", heatKeep: "厚墙体保温；双层隔热屋顶保温隔层", ventilation: "双层隔热屋顶通风散热", moisture: "厚墙体兼具防潮作用；铁窗铁门防雨水侵蚀", tempRange: "21~23℃", precipRange: "1700~2200mm", humidity: "75~85%", desc: "广东开平碉楼，坐西北向东南。", period: "ming_qing"},
    { name: "贵州石板房", coords: [105.449543, 25.10399], climate: "夏热冬冷区", temp: 16.5, precip: 1450, wall: 50, ratio: 0.25, pitch: 20, scores: {保温: 4,隔热: 5,通风: 7,防潮: 7,采光: 7}, wallMat: "石材砌筑（当地青石）、石板屋顶", roof: "悬山式或硬山式石板顶", courtyard: "三合院或四合院，石板铺地", insulation: "石板屋顶隔热、厚石墙、通风良好", heatKeep: "厚石墙、封闭院落、室内火塘", ventilation: "门窗对流、天井通风，夏季主导", moisture: "石板地面、高地基、墙体勾缝防水", tempRange: "15~18℃", precipRange: "1300~1600mm", humidity: "58~85%", desc: "贵州石板房，顺应地形变化，灵活多变，一般多坐北朝南。", period: "ming_qing"},
    { name: "福建土楼（圆楼）", coords: [117.020063, 24.667005], climate: "夏热冬暖区", temp: 19.5, precip: 1550, wall: 1500, ratio: 0.15, pitch: 30, scores: {保温: 8,隔热: 8,通风: 5,防潮: 7,采光: 6}, wallMat: "三合土（粘土、砂、石灰），传统夯筑，内部", roof: "坡屋顶，青瓦铺设，出檐深远", courtyard: "环形建筑，中心设天井（祖堂）", insulation: "厚土墙、环形通风、天井拔风", heatKeep: "厚土墙，冬季温和无需额外保温", ventilation: "环形走廊通风+天井拔风+门窗对流", moisture: "高地基、地面铺石板、墙体下部防潮处理", tempRange: "19~20℃", precipRange: "1400~1700mm", humidity: "68~85%", desc: "福建土楼（圆楼），整体坐北朝南，主入口依风水而定，内部房间按需调整。", period: "ming_qing"}
];
allHouses = allHousesData;

// 监听认证状态变化
auth.onAuthStateChanged(async (user) => {
    currentUser = user;
    const userInfo = document.getElementById('user-info');
    const loginBtn = document.getElementById('login-btn');
    const logoutBtn = document.getElementById('logout-btn');
    const favoritesBtn = document.getElementById('favorites-btn');

    if (user) {
        if (userInfo) userInfo.innerHTML = `欢迎，${user.email}`;
        if (loginBtn) loginBtn.style.display = 'none';
        if (logoutBtn) logoutBtn.style.display = 'inline-block';
        if (favoritesBtn) favoritesBtn.style.display = 'inline-block';
        await loadUserFavorites();
    } else {
        if (userInfo) userInfo.innerHTML = '';
        if (loginBtn) loginBtn.style.display = 'inline-block';
        if (logoutBtn) logoutBtn.style.display = 'none';
        if (favoritesBtn) favoritesBtn.style.display = 'none';
        userFavorites.clear();
    }
});

// 加载用户收藏
async function loadUserFavorites() {
    if (!currentUser) return;
    try {
        const doc = await db.collection('users').doc(currentUser.uid).get();
        if (doc.exists) {
            userFavorites = new Set(doc.data().favorites || []);
        }
    } catch (error) {
        console.error('加载收藏失败:', error);
    }
}

// 保存用户收藏
async function saveUserFavorites() {
    if (!currentUser) return;
    try {
        await db.collection('users').doc(currentUser.uid).set({
            favorites: Array.from(userFavorites)
        }, { merge: true });
    } catch (error) {
        console.error('保存收藏失败:', error);
    }
}

// 切换收藏状态
async function toggleFavorite(houseName) {
    if (!currentUser) {
        showToast('请先登录', 'error');
        showLoginModal();
        return;
    }

    if (userFavorites.has(houseName)) {
        userFavorites.delete(houseName);
        showToast('已取消收藏', 'success');
    } else {
        userFavorites.add(houseName);
        showToast('已收藏', 'success');
    }

    await saveUserFavorites();
}

// 显示登录模态框
function showLoginModal() {
    const modal = document.getElementById('login-modal');
    if (modal) modal.style.display = 'block';
    const title = document.getElementById('modal-title');
    if (title) title.textContent = '用户登录';
    const submitBtn = document.getElementById('auth-submit-btn');
    if (submitBtn) submitBtn.textContent = '登录';
}

// 隐藏登录模态框
function hideLoginModal() {
    const modal = document.getElementById('login-modal');
    if (modal) modal.style.display = 'none';
}

// 登录/注册
async function handleAuth(email, password, isRegister) {
    try {
        if (isRegister) {
            await auth.createUserWithEmailAndPassword(email, password);
            showToast('注册成功', 'success');
        } else {
            await auth.signInWithEmailAndPassword(email, password);
            showToast('登录成功', 'success');
        }
        hideLoginModal();
    } catch (error) {
        console.error('认证失败:', error);
        let message = '操作失败';
        if (error.code === 'auth/weak-password') message = '密码太弱';
        else if (error.code === 'auth/email-already-in-use') message = '邮箱已被使用';
        else if (error.code === 'auth/invalid-email') message = '无效邮箱';
        else if (error.code === 'auth/user-not-found') message = '用户不存在';
        else if (error.code === 'auth/wrong-password') message = '密码错误';
        showToast(message, 'error');
    }
}

// 退出登录
function logout() {
    auth.signOut().then(() => {
        showToast('已退出登录', 'success');
    }).catch((error) => {
        console.error('退出登录失败:', error);
    });
}

// Toast通知
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    if (!toast) return;
    toast.textContent = message;
    toast.className = `toast ${type}`;
    toast.classList.add('show');
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// 切换登录/注册模式
function toggleAuthMode() {
    const title = document.getElementById('modal-title');
    const submitBtn = document.getElementById('auth-submit-btn');
    const toggleText = document.getElementById('auth-toggle');

    if (title && submitBtn && toggleText) {
        if (title.textContent === '用户登录') {
            title.textContent = '用户注册';
            submitBtn.textContent = '注册';
            toggleText.innerHTML = '已有账号？<a href="#" onclick="toggleAuthMode()">立即登录</a>';
        } else {
            title.textContent = '用户登录';
            submitBtn.textContent = '登录';
            toggleText.innerHTML = '还没有账号？<a href="#" onclick="toggleAuthMode()">立即注册</a>';
        }
    }
}

// 返回顶部功能
function setupBackToTop() {
    const backBtn = document.getElementById('backToTop');
    if (backBtn) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 300) {
                backBtn.classList.add('show');
            } else {
                backBtn.classList.remove('show');
            }
        });
        backBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
}

// 关闭模态框事件绑定
function setupModalEvents() {
    // 关闭按钮
    const closeBtn = document.querySelector('.close');
    if (closeBtn) {
        closeBtn.addEventListener('click', hideLoginModal);
    }

    // 点击外部关闭
    const modal = document.getElementById('login-modal');
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                hideLoginModal();
            }
        });
    }

    // 表单提交
    const authForm = document.getElementById('auth-form');
    if (authForm) {
        authForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const title = document.getElementById('modal-title').textContent;
            const isRegister = title === '用户注册';
            await handleAuth(email, password, isRegister);
        });
    }
}

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    setupBackToTop();
    setupModalEvents();
});
