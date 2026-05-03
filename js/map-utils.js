

const MAP_CONFIG = {
    // GeoJSON 数据路径（DataV.GeoAtlas 格式）
    geoJsonPath: 'data/china.json',
    // 地图经纬度范围（适配地图图片）
    bounds: {
        west: 72.0,   // 最西端
        east: 136.0,  // 最东端
        south: 18.0,  // 最南端
        north: 54.0   // 最北端
    },
    // 坐标校准偏移（用于微调，适配不同地图图片）
    offset: {
        x: 0,   // X轴偏移
        y: 0   // Y轴偏移
    },
    // 缩放系数
    scale: 1.0,
    // 气候区颜色
    climateColors: {
        '严寒区': '#4A6FA5',
        '寒冷区': '#C8C6C6',
        '夏热冬冷区': '#6A994E',
        '夏热冬暖区': '#E28A55',
        '温和区': '#E8CFF3'
    },
    // 地图样式
    mapStyle: {
        fillColor: '#F5F0E8',      // 省份填充色
        strokeColor: '#B8A88A',    // 省界线颜色
        strokeWidth: 1.5,          // 省界线宽度
        coastColor: '#8B7D6B',     // 海岸线颜色
        coastWidth: 2,             // 海岸线宽度
        backgroundColor: '#F5F0E8' // 背景色
    }
};

/**
 * 将经纬度转换为 Canvas 像素坐标（等距矩形投影）
 * @param {number} lng - 经度
 * @param {number} lat - 纬度
 * @param {number} canvasWidth - Canvas 宽度
 * @param {number} canvasHeight - Canvas 高度
 * @returns {{x: number, y: number}} 像素坐标
 */
function geoToPixel(lng, lat, canvasWidth, canvasHeight) {
    // 中国实际经纬度范围，匹配地图图片
    const west = 73.0;
    const east = 135.0;
    const south = 18.0;
    const north = 54.0;
    
    // 计算地图显示区域（留4%边距）
    const padding = 0.04;
    const displayW = canvasWidth * (1 - padding * 2);
    const displayH = canvasHeight * (1 - padding * 2);
    const offsetX = canvasWidth * padding;
    const offsetY = canvasHeight * padding;
    
    // 线性转换经纬度到像素
    let x = ((lng - west) / (east - west)) * displayW + offsetX;
    let y = ((north - lat) / (north - south)) * displayH + offsetY;
    
    // 微调，让散点落到正确省份
    x = x - canvasWidth * 0.03;
    y = y - canvasHeight * 0.02;
    
    return { x, y };
}

/**
 * 将像素坐标转换为经纬度
 * @param {number} px - 像素X
 * @param {number} py - 像素Y
 * @param {number} canvasWidth - Canvas 宽度
 * @param {number} canvasHeight - Canvas 高度
 * @returns {{lng: number, lat: number}} 经纬度
 */
function pixelToGeo(px, py, canvasWidth, canvasHeight) {
    const bounds = MAP_CONFIG.bounds;
    const w = canvasWidth || MAP_CONFIG.imgWidth || 1913;
    const h = canvasHeight || MAP_CONFIG.imgHeight || 1358;
    const lng = bounds.west + (px / w) * (bounds.east - bounds.west);
    const lat = bounds.north - (py / h) * (bounds.north - bounds.south);
    return { lng, lat };
}

/**
 * 从 GeoJSON 数据中提取所有坐标路径
 * @param {Object} geojson - GeoJSON FeatureCollection
 * @returns {Array<Array<{x: number, y: number}>>} 路径数组
 */
function extractGeoPaths(geojson, canvasWidth, canvasHeight) {
    const paths = [];
    if (!geojson || !geojson.features) return paths;

    geojson.features.forEach(feature => {
        if (!feature.geometry) return;
        
        const processCoords = (coords) => {
            const path = [];
            coords.forEach(coord => {
                if (Array.isArray(coord[0]) && typeof coord[0] !== 'number') {
                    // 嵌套数组（MultiPolygon 或 Polygon 的 ring）
                    const subPath = processCoords(coord);
                    if (subPath.length > 0) paths.push(subPath);
                } else if (coord.length >= 2 && typeof coord[0] === 'number') {
                    // 单个坐标点
                    const { x, y } = geoToPixel(coord[0], coord[1], canvasWidth, canvasHeight);
                    path.push({ x, y });
                }
            });
            return path;
        };

        if (feature.geometry.type === 'Polygon') {
            feature.geometry.coordinates.forEach(ring => {
                const path = [];
                ring.forEach(coord => {
                    const { x, y } = geoToPixel(coord[0], coord[1], canvasWidth, canvasHeight);
                    path.push({ x, y });
                });
                if (path.length > 0) paths.push(path);
            });
        } else if (feature.geometry.type === 'MultiPolygon') {
            feature.geometry.coordinates.forEach(polygon => {
                polygon.forEach(ring => {
                    const path = [];
                    ring.forEach(coord => {
                        const { x, y } = geoToPixel(coord[0], coord[1], canvasWidth, canvasHeight);
                        path.push({ x, y });
                    });
                    if (path.length > 0) paths.push(path);
                });
            });
        }
    });

    return paths;
}

/**
 * 在 Canvas 上绘制 GeoJSON 地图
 * @param {HTMLCanvasElement} canvas - Canvas 元素
 * @param {Object} geojson - GeoJSON 数据
 * @param {Object} style - 样式选项
 */
function drawGeoJsonMap(canvas, geojson, style) {
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;
    const s = Object.assign({}, MAP_CONFIG.mapStyle, style || {});

    // 清空背景
    ctx.fillStyle = s.backgroundColor;
    ctx.fillRect(0, 0, w, h);

    // 提取路径
    const paths = extractGeoPaths(geojson, w, h);

    // 绘制填充
    ctx.beginPath();
    paths.forEach(path => {
        if (path.length < 3) return;
        ctx.moveTo(path[0].x, path[0].y);
        for (let i = 1; i < path.length; i++) {
            ctx.lineTo(path[i].x, path[i].y);
        }
        ctx.closePath();
    });
    ctx.fillStyle = s.fillColor;
    ctx.fill();

    // 绘制边界线
    ctx.beginPath();
    paths.forEach(path => {
        if (path.length < 2) return;
        ctx.moveTo(path[0].x, path[0].y);
        for (let i = 1; i < path.length; i++) {
            ctx.lineTo(path[i].x, path[i].y);
        }
        ctx.closePath();
    });
    ctx.strokeStyle = s.strokeColor;
    ctx.lineWidth = s.strokeWidth;
    ctx.stroke();
}

/**
 * 在 Canvas 上绘制民居散点
 * @param {HTMLCanvasElement} canvas - Canvas 元素
 * @param {Array} houses - 民居数据数组
 * @param {Object} options - 选项
 */
function drawHousePoints(canvas, houses, options) {
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;
    const opts = Object.assign({
        glowRadius: 12,
        dotRadius: 6,
        borderWidth: 2,
        showLabel: false,
        labelFontSize: 11
    }, options || {});

    houses.forEach(house => {
        const { x, y } = geoToPixel(house.coords[0], house.coords[1], w, h);
        const color = MAP_CONFIG.climateColors[house.climate] || '#888';

        // 光晕
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, opts.glowRadius);
        gradient.addColorStop(0, color + 'CC');
        gradient.addColorStop(1, color + '00');
        ctx.beginPath();
        ctx.arc(x, y, opts.glowRadius, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();

        // 圆点
        ctx.beginPath();
        ctx.arc(x, y, opts.dotRadius, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
        ctx.strokeStyle = '#FFF';
        ctx.lineWidth = opts.borderWidth;
        ctx.stroke();

        // 标签
        if (opts.showLabel) {
            ctx.fillStyle = '#2A3B4C';
            ctx.font = `bold ${opts.labelFontSize}px sans-serif`;
            ctx.textAlign = 'center';
            ctx.fillText(house.name, x, y - opts.dotRadius - 4);
        }

        // 存储数据用于点击检测
        house._px = x;
        house._py = y;
    });
}

/**
 * 检测点击位置是否命中某个民居点
 * @param {number} clickX - 点击X坐标
 * @param {number} clickY - 点击Y坐标
 * @param {Array} houses - 民居数据
 * @returns {Object|null} 命中的民居对象
 */
function hitTest(clickX, clickY, houses) {
    const threshold = 15;
    for (const house of houses) {
        if (house._px === undefined) continue;
        const dx = clickX - house._px;
        const dy = clickY - house._py;
        if (dx * dx + dy * dy < threshold * threshold) {
            return house;
        }
    }
    return null;
}

/**
 * 在 Canvas 上绘制热力图（简化版 - 使用散点密度）
 * @param {HTMLCanvasElement} canvas - Canvas元素
 * @param {Array} houses - 民居数据
 * @param {string} mode - 热力图模式：'temp' | 'precip' | 'wall' | 'none'
 */
function drawHeatmap(canvas, houses, mode) {
    if (mode === 'none') return;
    
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    
    // 获取数值范围
    let minVal, maxVal;
    const values = houses.map(h => {
        if (mode === 'temp') return h.temp;
        if (mode === 'precip') return h.precip;
        if (mode === 'wall') return h.wall;
        return 0;
    });
    minVal = Math.min(...values);
    maxVal = Math.max(...values);
    
    // 颜色映射函数
    function getColor(value) {
        const ratio = (value - minVal) / (maxVal - minVal);
        if (mode === 'temp') {
            if (ratio < 0.5) {
                const r = ratio * 2;
                return `rgba(80, 163, 186, ${1 - r * 0.5})`;
            } else {
                const r = (ratio - 0.5) * 2;
                return `rgba(234, 199, 54, ${1 - r * 0.5})`;
            }
        } else if (mode === 'precip') {
            return `rgba(46, 121, 193, ${0.3 + ratio * 0.5})`;
        } else {
            return `rgba(141, 85, 36, ${0.3 + ratio * 0.5})`;
        }
    }
    
    // 绘制热力点
    houses.forEach(house => {
        const { x, y } = geoToPixel(house.coords[0], house.coords[1], width, height);
        const value = mode === 'temp' ? house.temp : mode === 'precip' ? house.precip : house.wall;
        const color = getColor(value);
        
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, 30);
        gradient.addColorStop(0, color);
        gradient.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.beginPath();
        ctx.arc(x, y, 30, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
    });
}

/**
 * 绘制图例
 * @param {HTMLCanvasElement} canvas - Canvas元素
 * @param {string} mode - 当前热力图模式
 */
function drawLegend(canvas, mode) {
    if (mode === 'none') return;
    
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    
    const legendX = 20;
    const legendY = height - 120;
    const legendWidth = 20;
    const legendHeight = 80;
    
    // 图例背景
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.strokeStyle = '#ddd';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(legendX - 10, legendY - 20, legendWidth + 20, legendHeight + 50, 8);
    ctx.fill();
    ctx.stroke();
    
    // 渐变条
    const gradient = ctx.createLinearGradient(legendX, legendY + legendHeight, legendX, legendY);
    if (mode === 'temp') {
        gradient.addColorStop(0, '#50a3ba');
        gradient.addColorStop(0.5, '#eac736');
        gradient.addColorStop(1, '#d94e5d');
    } else if (mode === 'precip') {
        gradient.addColorStop(0, '#d5e4f9');
        gradient.addColorStop(1, '#2e79c1');
    } else {
        gradient.addColorStop(0, '#f1e9ce');
        gradient.addColorStop(1, '#8d5524');
    }
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.roundRect(legendX, legendY, legendWidth, legendHeight, 4);
    ctx.fill();
    
    // 文字
    ctx.fillStyle = '#5A3A2A';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'center';
    
    const labels = { 'temp': '年均温', 'precip': '年降水', 'wall': '墙体厚度' };
    const units = { 'temp': '°C', 'precip': 'mm', 'wall': 'mm' };
    
    ctx.fillText('高', legendX + legendWidth / 2, legendY - 5);
    ctx.fillText('低', legendX + legendWidth / 2, legendY + legendHeight + 15);
    ctx.fillText(labels[mode], legendX + legendWidth / 2, legendY + legendHeight + 35);
}