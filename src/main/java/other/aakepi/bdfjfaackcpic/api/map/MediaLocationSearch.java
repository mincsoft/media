package other.aakepi.bdfjfaackcpic.api.map;

import com.rkhd.platform.sdk.api.ApiSupport;
import com.rkhd.platform.sdk.http.Request;
import com.rkhd.platform.sdk.test.tool.TestCustomizeApiTool;
import net.sf.json.JSONArray;
import net.sf.json.JSONObject;
import org.apache.commons.lang.StringUtils;
import org.apache.commons.lang.math.NumberUtils;
import other.aakepi.bdfjfaackcpic.api.BaseApiSupport;
import other.aakepi.bdfjfaackcpic.util.MapUtil;

import java.util.HashMap;
import java.util.Map;

/**
 * 媒体投放地图查询
 * Created by YuJinliang on 16/10/6.
 */
public class MediaLocationSearch extends BaseApiSupport implements ApiSupport {


    @Override
    public String execute(Request request, Long userId, Long tenantId) {
        int first = 0;
        int size = 20;

        Map<String, Object> returnMap = new HashMap<String, Object>();

        String op = request.getParameter("op");

        JSONObject condition = new JSONObject();
        condition.put("lng", request.getParameter("lng"));
        condition.put("lat", request.getParameter("lat"));
        condition.put("distance", request.getParameter("distance"));
        condition.put("startDate", request.getParameter("startDate"));

        logger.debug("condition-------" + condition.toString());

        String start = request.getParameter("start");
        if (StringUtils.isNotBlank(start)) {
            int startInt = NumberUtils.toInt(start);
            first = startInt * size;
        }

        String result = getMediaLocation(condition, first, size);

        return result;
    }

    /**
     * 待关联查询开放，后期优化
     *
     * @param condition
     * @param first
     * @param size
     * @return
     */
    private String getMediaLocation(JSONObject condition, int first, int size) {
        JSONArray records = new JSONArray();
        JSONObject record = null;
        JSONObject result = new JSONObject();

        StringBuffer sql = new StringBuffer();
        sql.append("select id, meidaId from saleContractSpot ");
        sql.append(" where id > 0 ");
        if (isNotNull(condition, "startDate")) {
            sql.append(" and endDate >= " + condition.getString("startDate"));
            sql.append(" and startDate <= " + condition.getString("startDate"));
        }

        JSONArray spotArray = queryResultArray(sql.toString());
        if (spotArray != null) {
            StringBuffer cond = new StringBuffer();
            for (int i = 0; i < spotArray.size(); i++) {
                cond.append(spotArray.getJSONObject(i).getInt("meidaId"));
                if (i < (spotArray.size() - 1))
                    cond.append(",");
            }

            double base_distance = condition.getDouble("distance");
            double base_lng = condition.getDouble("lng");
            double base_lat = condition.getDouble("lat");

            JSONObject squPointRange = MapUtil.getSquareRange(base_lng, base_lat, base_distance);
            if (squPointRange != null) {
                double lngL = squPointRange.getDouble("lngL");
                double lngR = squPointRange.getDouble("lngR");
                double latB = squPointRange.getDouble("latB");
                double latT = squPointRange.getDouble("latT");

                sql = new StringBuffer();
                sql.append("select id,name,address,mediaStatus,lng,lat from media ");
                sql.append(" where id in (" + cond.toString() + ") ");
                sql.append(" and ((lng >= " + lngL + " and lng <=" + lngR + ") or (lng >= " + lngR + " and lng <=" + lngL + ")) ");
                sql.append(" and ((lat >= " + latB + " and lat <=" + latT + ") or (lat >= " + latT + " and lat <=" + latB + ")) ");
            }
            JSONArray mediaArray = queryResultArray(sql.toString());

            if (mediaArray != null) {
                JSONObject media = null;

                for (int i = 0; i < mediaArray.size(); i++) {
                    media = mediaArray.getJSONObject(i);
                    if (media == null) continue;
                    //{\"id\":\"16228428\",\"latitude\":\"39.999203\",\"longitude\":\"116.375786\",
                    // \"location\":\"奥运村\",\"locationDetail\":\"中科院物理所\",\"day\":\"1476979200000\",
                    // \"startTime\":\"1477053707554\"}
                    record = new JSONObject();
                    record.put("id", media.getInt("id"));
                    record.put("latitude", media.getString("lat"));
                    record.put("longitude", media.getString("lng"));
                    record.put("location", media.getString("address"));
                    record.put("locationDetail", media.getString("address"));
                    record.put("media", media.getString("name"));
//                    record.put("startTime", DateUtil.getDate(condition.getString("startDate"), "yyyy-MM-dd HH:mm"));
                    records.add(record);
                }
            }

            JSONObject data = new JSONObject();
            data.put("trackData", records);
            result.put("status", 0);
            result.put("statusText", "成功");
            result.put("data", data);

        }
        return result.toString();
    }


    private boolean isNotNull(JSONObject condition, String time) {
        return condition != null && condition.containsKey(time) && StringUtils.isNotBlank(condition.getString(time));
    }


    public static void main(String[] args) {
        TestCustomizeApiTool testTriggerTool = new TestCustomizeApiTool();
        MediaLocationSearch api = new MediaLocationSearch();
        testTriggerTool.test("search-adventmedia", api);
    }


}
