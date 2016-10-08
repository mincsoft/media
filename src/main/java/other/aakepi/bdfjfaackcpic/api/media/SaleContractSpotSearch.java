package other.aakepi.bdfjfaackcpic.api.media;

import com.rkhd.platform.sdk.api.ApiSupport;
import com.rkhd.platform.sdk.http.Request;
import net.sf.json.JSONArray;
import net.sf.json.JSONObject;
import org.apache.commons.lang.StringUtils;
import other.aakepi.bdfjabipeepce.util.DateUtil;
import other.aakepi.bdfjfaackcpic.api.QueryResult;
import other.aakepi.bdfjfaackcpic.config.SpotField;

import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 销售合同排期查询
 * Created by yangyixin on 16/10/8.
 */
public class SaleContractSpotSearch extends BaseSpotSearch implements ApiSupport {

    @Override
    public String execute(Request request, Long userId, Long tenantId) {

        String contractId = request.getParameter("id");
        if (StringUtils.isBlank(contractId)) contractId="-1";
        JSONObject contract = getContract(contractId);

        Map<String, Object> returnMap = new HashMap<String, Object>();

        returnMap.put("contract", contract);
        //合同不为空
        if (!contract.isEmpty()){
            initParam(request);

            Date startDate = DateUtil.getDate(contract.getString("startDate"));
            Date endDate = DateUtil.getDate(contract.getString("endDate"));

            JSONObject sheetObj = sheet(startDate, endDate, null);
            returnMap.put("sheet", sheetObj);
        }

        return JSONObject.fromObject(returnMap).toString();
    }

    /**
     * 查询合同
     * @return
     */
    private JSONObject getContract(String contractId) {
        StringBuffer sql = new StringBuffer();
        sql.append("select id,title,startDate,endDate from contract where id=").append(contractId);
        QueryResult queryResult = queryResult(sql.toString());
        if (queryResult==null) return new JSONObject();
        if (queryResult.getCount()==0) return new JSONObject();
        return queryResult.getRecords().getJSONObject(0);
    }
    /**
     * 初始化显示字段
     */
    protected void initSpotConfig() {
        //添加显示的字段：
        spotConfig.addField("name", 150, null);
        spotConfig.addField("form", 80, null);
        spotConfig.addField("entityType", 80, null);
        spotConfig.addField("opMode", 80, null);
        spotConfig.addField("saleStatus", 80, null);
        spotConfig.addField("address", 150, null);
        spotConfig.addField("retailPrice", 100, " fm: \"money||2|none\"");

        //在单价后显示排期点位信息
        spotConfig.setShowSpotFieldName("retailPrice");
    }


    /**
     * 获得媒体和广告位的JSON数组
     *
     * @param first
     * @param size
     * @return
     */
    protected JSONArray getMediaSpotCellData( int first, int size, int sheetId) {
        JSONArray headData = new JSONArray();
        QueryResult result = getAllMedia(first, size);
        if (result == null) return headData;
        if (result.getTotalSize() == null) return headData;

        if (result.getTotalSize() > 0) {
            //全部的媒体记录
            JSONArray records = result.getRecords();

            for (int i = 0; i < records.size(); i++) {
                //从第四行开始
                int startRow = 4 + i;
                int dateColumns = 0;
                JSONObject record = records.getJSONObject(i);

                JSONObject col0 = getItemObject(sheetId, startRow, dateColumns++);
                col0.accumulate("json", "{id: \"" + record.get("id") + "\"}");
                headData.add(col0);

                List<SpotField> spotFieldList = spotConfig.getSpotFielList();
                for (int j = 0; j < spotFieldList.size(); j++) {
                    SpotField spotField = spotFieldList.get(j);
                    String fieldName = spotField.getEn();
                    if ("select".equals(spotField.getType()) || "entityType".equals(spotField.getType())) {
                        headData.add(getColItemSelect(sheetId, startRow, dateColumns++, record, fieldName));
                    } else {
                        Object value = record.get(fieldName);
                        headData.add(getColItemObject(sheetId, startRow, dateColumns++, value));
                    }
                }
            }
        }
        return headData;
    }



    /**
     * 查询全部的媒体记录
     *
     * @return
     */
    private QueryResult getAllMedia(int first, int size) {
        String mediaName = request.getParameter("mediaName");

        String spotField = spotConfig.getSql();
        StringBuffer sql = new StringBuffer();
        sql.append("select id,").append(spotField).append(" from media ");
        if (StringUtils.isNotBlank(mediaName)) {
            sql.append(" where name like '%").append(mediaName).append("%'");
        }
        sql.append(" order by name");
        sql.append(" limit ").append(first).append(",").append(size);

        return queryResult(request, sql.toString());
    }


}
