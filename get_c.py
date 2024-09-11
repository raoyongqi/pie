import requests
import json

# 高德地图 API key
api_key = "634d7ad3bd0bfeb370acfa403505291e"

# 读取本地 JSON 文件
with open('site2.js', 'r', encoding='utf-8') as f:
    js_content = f.read()
    
    # 去掉 'export const capitals = '，保留 JSON 部分
    json_data = js_content.replace('export const capitals = ', '').strip()
    
    # 移除文件末尾的分号和右中括号
    if json_data.endswith(';'):
        json_data = json_data[:-1]

    # 将剩下的内容转换为 JSON
    capitals = json.loads(json_data)

# 用于存储每个省、市、县的中心点信息
region_centers = []

# 高德地图 API 查询函数
def get_region_center(region_name, api_key):
    url = f"https://restapi.amap.com/v3/config/district?keywords={region_name}&subdistrict=0&key={api_key}"
    response = requests.get(url)
    data = response.json()
    if data["status"] == "1" and data["districts"]:
        district = data["districts"][0]
        # 提取中心位置坐标
        adcode = district.get("adcode", None)
        center = district.get("center", "")
        if center:
            lon, lat = map(float, center.split(","))
            return {
                "name": region_name,
                "adcode": adcode,
                "center": [lon, lat]
            }
    return None

# 遍历每个省、市、县并获取中心点
for item in capitals:
    for region_type in ["province", "city", "district"]:
        region_name = item.get(region_type, '')
        if region_name:
            center_info = get_region_center(region_name, api_key)
            if center_info:
                region_centers.append(center_info)

# 去重，防止重复查询同一个省、市、县
unique_region_centers = []
seen_names = set()

for region in region_centers:
    if region["name"] not in seen_names:
        unique_region_centers.append(region)
        seen_names.add(region["name"])

# 打印结果
print(json.dumps(unique_region_centers, ensure_ascii=False, indent=4))

# 保存为 JSON 文件
with open('region_centers.json', 'w', encoding='utf-8') as f:
    json.dump(unique_region_centers, f, ensure_ascii=False, indent=4)
