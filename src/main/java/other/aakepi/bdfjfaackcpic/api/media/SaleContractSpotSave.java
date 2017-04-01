package other.aakepi.bdfjfaackcpic.api.media;


import com.rkhd.platform.sdk.api.ApiSupport;
import com.rkhd.platform.sdk.http.Request;
import net.sf.json.JSONArray;
import net.sf.json.JSONObject;
import org.apache.commons.lang.StringUtils;
import org.apache.commons.lang.math.NumberUtils;
import other.aakepi.bdfjfaackcpic.config.SpotField;
import other.aakepi.bdfjfaackcpic.util.DateUtil;
import other.aakepi.bdfjfaackcpic.util.DoubleUtil;
import other.aakepi.bdfjfaackcpic.util.JSONUtil;

import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.*;

/**
 * 销售合同排期保存，继承查询对象，自动获得字段显示顺序
 * Created by yangyixin on 16/10/8.
 */
public class SaleContractSpotSave extends SaleContractSpotSearch implements ApiSupport {

    long spotDateBelongId;//点位表BelongId
    long mediaSpotDate888BelongID;  //媒体库点位表
    /**
     * 初始化
     *
     */
    protected void initParam() {
        super.initParam();
//        spotDateBelongId = getBelongId(allBelongs, "saleContractSpotDate");
        spotDateBelongId =100018293;//Long.parseLong(Configuration4Belong.getInstance().getValue("saleContractSpotDateBelongId")) ;
        mediaSpotDate888BelongID=100274711; //Long.parseLong(Configuration4Belong.getInstance().getValue("mediaSpotDate888BelongId"));
    }
    @Override
    public String execute(Request request, Long userId, Long tenantId) {
        initRequest(request);
        long start = System.currentTimeMillis();
        contractId = request.getParameter("id");
        startDate = DateUtil.getDate(request.getParameter("startDate"));
        endDate = DateUtil.getDate(request.getParameter("endDate"));
        String json = request.getParameter("json");
        logger.debug("==request.getParameter(\"json\")=="+json);

        JSONObject jsonResult = new JSONObject();

//        com.alibaba.fastjson.JSONArray cellArray = null;
        JSONArray cellArray = null;
        logger.debug("load start:" + (System.currentTimeMillis() - start) + " ms");
//        com.alibaba.fastjson.JSONObject obj1 = com.alibaba.fastjson.JSONObject.parseObject(json);

        JSONObject obj1 = JSONObject.fromObject(json);
        if (obj1.containsKey("cells")) {
            cellArray = obj1.getJSONArray("cells");
            //logger.debug("size:"+cellArray.size()+"value:" +cellArray.get(0));
        }
        logger.debug("load start obj:" + (System.currentTimeMillis() - start) + " ms");


        if (StringUtils.isBlank(json) || startDate == null || endDate == null || StringUtils.isBlank(contractId) || cellArray == null || cellArray.isEmpty()) {
            jsonResult.accumulate("message", "参数错误");
            jsonResult.accumulate("success", false);
            return jsonResult.toString();
        }
        //初始化合同
        contract = getContract(contractId);
        logger.info("获得合同信息contract============："+contract);

        //占用人信息
        long ownerId = contract.getLong("ownerId");
        String userName = getUserName(ownerId);
        //合同不为空
        if (contract.isEmpty() || contract.containsKey("error_code")) {
            jsonResult.accumulate("message", "参数错误");
            jsonResult.accumulate("success", false);
            return jsonResult.toString();
        }
        //初始化参数
        initParam();

        HashMap<Integer, String> colTempMap = colTempMap();
        List<HashMap<String, String>> spotList = new ArrayList<HashMap<String, String>>();
        HashMap<String, String> uuidMap = new HashMap<String, String>(cellArray.size());

        logger.debug("load title:" + (System.currentTimeMillis() - start) + " ms");
        //行号，spot的行号
        //解析全部数据
        for (int i = 0; i < cellArray.size(); i++) {

//            com.alibaba.fastjson.JSONObject cell = (com.alibaba.fastjson.JSONObject) cellArray.get(i);
           JSONObject cell = cellArray.getJSONObject(i);
            if (cell == null)
                continue;

            int row = cell.getInt("row");
            //从第四行开始
            if (row <= 3)
                continue;
            int col = cell.getInt("col");
            String json1 = cell.getString("json");
//            com.alibaba.fastjson.JSONObject jsonCell = com.alibaba.fastjson.JSONObject.parseObject(json1);
            JSONObject jsonCell = JSONObject.fromObject(json1);
            if (jsonCell != null) {
                HashMap<String, String> dataMap = new HashMap<String, String>();
                if (row >= spotList.size()) {
                    for (int j = spotList.size(); j <= row; j++) {
                        spotList.add(new HashMap<String, String>(colTempMap.size()));
                    }
                }
                dataMap = spotList.get(row);

//                String data = jsonCell.getString("data");
//                String value = jsonCell.getString("value");
//                String id = jsonCell.getString("id");
//                String cal = jsonCell.getString("cal");

                String data = jsonCell.containsKey("data")?jsonCell.getString("data"):"";
                String value = jsonCell.containsKey("value")?jsonCell.getString("value"):"";
                String id = jsonCell.containsKey("id")?jsonCell.getString("id"):"";
                String cal = jsonCell.containsKey("cal")?jsonCell.getString("cal"):"";

                String key = colTempMap.get(col);
                //包含指定的列
                if (colTempMap.containsKey(col)) {
                    if ("true".equals(cal)) {
                        data = value;
                    }
                    if ("uuid".equals(key)) {
                        if (StringUtils.isNotBlank(id)) {
                            //复制某一行，结果UUID也复制了,所以复制的uuid，设置为新增。
                            if (uuidMap.containsKey(id)) {
                                //
                                id = "";
                            } else {
                                uuidMap.put(id, id);
                            }
                            //内容＝ID
                            data = id;
                        }
                    }else if ("name".equals(key)){
                        //媒体名称
                        dataMap.put("mediaId",id);
                    }
                    dataMap.put(key, data);
                }

                logger.debug("row:" + row + ";col=" + col + ";key="+key+";data=" + data + ";value=" + value + ";id=" + id + ";all:" + cellArray.get(i));
//				logger.debug("load data :"+ i +" : "+ (System.currentTimeMillis() - start) + " ms");
            }
        }

        logger.debug("load data:" + (System.currentTimeMillis() - start) + " ms");
        start = System.currentTimeMillis();


        //处理业务：

        int rows = 0;
        int delRow = 0;
        StringBuffer stringBuffer_msg = new StringBuffer();
        boolean hasSpotItem = false;
        //获得合同所有的销售合同点位信息
        Map<String,JSONObject> saleContractSpotDateMap=getSalesSpotDateMap(contractId);
        for (int i = 0; i < spotList.size(); i++) {
            HashMap<String, String> dataMap = spotList.get(i);
            logger.debug("i:" + i + ";" + dataMap);

            String spotId =  dataMap.get("uuid");//行唯一编号
            String mediaId = dataMap.get("mediaId");//媒体ID
            String firstName = dataMap.get(spotConfig.getFistFieldName());

            //空行
            if (StringUtils.isBlank(spotId) && StringUtils.isBlank(firstName)&& StringUtils.isBlank(mediaId)) {
                continue;
            }

            //小计行不处理
            if (StringUtils.isNotBlank(spotId) && (firstName.indexOf("小计") >= 0 || firstName.indexOf("总计") >= 0)) {
                continue;
            }

            int currentRow = i;

            hasSpotItem = true;
            //点位纪录
            JSONArray spotPlanDateList = getSpotDate(spotId);
            logger.info("==excute.getSpotDate======"+spotPlanDateList);

            int spotNum = 0;
            //------------------------------------------
            if (startDate != null && endDate != null) {
                Calendar startCal = Calendar.getInstance();
                startCal.setTime(startDate);
                Calendar endCal = Calendar.getInstance();
                endCal.setTime(endDate);
                //date_0_2015-01-01
                endCal.add(Calendar.DATE, 1);//最后日期加一天，便于循环

                boolean hasSpot = false;
                Map<String,Map>  mediaIDExistMap=new HashMap<String, Map>();
                Map<String,JSONObject>  mediaSpotMap;
                if (mediaIDExistMap.isEmpty()||!mediaIDExistMap.containsKey(mediaId)){
                    mediaSpotMap=getMediaSpotDateMap(NumberUtils.toLong(mediaId),startDate.getTime(),endDate.getTime());
                    mediaIDExistMap.put(mediaId,mediaSpotMap);
                }else{
                    mediaSpotMap=mediaIDExistMap.get(mediaId);
                }
                while (startCal.before(endCal)) {
                    String date = String.format("%tF", startCal.getTime());
                    startCal.add(Calendar.DATE, 1);//开始日期加1

//						String dateKey = "date_" + i + "_" + date;
                    String dateValue = dataMap.get(date);
                    double dateSpot = DoubleUtil.getValue(dateValue, 2, 0);

                    if (!hasSpot && StringUtils.isNotBlank(dateValue)) {
                        hasSpot = true;
                        ++ spotNum;
                    }
                    if (StringUtils.isBlank(dateValue)) continue;


                    //更新销售合同媒体点位表，
                    if(!saleContractSpotDateMap.isEmpty()&&saleContractSpotDateMap.containsKey(date+"&"+mediaId)){
                       JSONObject saleContractSpotDate= saleContractSpotDateMap.get(date+"&"+mediaId);
                        saleContractSpotDate.put("spot", "2");
                        updateBelongs(saleContractSpotDate);
                        saleContractSpotDateMap.remove(date+"&"+mediaId);
                    }else {
                        JSONObject spotDate = new JSONObject();
                        spotDate.accumulate("day",date);
                        spotDate.accumulate("spot","2");
                        spotDate.accumulate("spotId",spotId);
                        spotDate.accumulate("contractId",contractId);
                        spotDate.accumulate("meidaId",mediaId);
                        spotDate.accumulate("dimDepart",contract.getLong("dimDepart"));
                        logger.info("SaleContractSpotSave.execute: 新增的销售媒体点位"+spotDate);
                        createBelongs(spotDateBelongId,spotDate);
                    }
                    //更新媒体点位总表
                    if(!mediaSpotMap.isEmpty()&&mediaSpotMap.containsKey(date+"&"+mediaId)){
                        JSONObject mediaSpot= mediaSpotMap.get(date+"&"+mediaId);
                        mediaSpot.put("spot", "2");
                        mediaSpot.put("comment", userName);
                        updateBelongs(mediaSpot);
                    }else {
                        //在插入purContrantSpotDate的同时往媒体总库中插入输入。
                        JSONObject mediaSpotDate = new JSONObject();
                        mediaSpotDate.accumulate("customItem1",date);
                        mediaSpotDate.accumulate("spot","2");
                        mediaSpotDate.accumulate("meidaID",mediaId);
                        //在备注中放入合同所有人
                        mediaSpotDate.accumulate("comment",userName);
                        mediaSpotDate.accumulate("dimDepart",contract.getLong("dimDepart"));
                        logger.info("SaleContractSpotSave.execute: mediaSpotDate888BelongID 新增媒体点位库"+mediaSpotDate);
                        createBelongs(mediaSpotDate888BelongID,mediaSpotDate);
                    }

                 /* boolean existsSalSpotData = false;
                    for (int j = 0; j < spotPlanDateList.size(); j++) {
                        JSONObject spotDate = spotPlanDateList.getJSONObject(j);
                        logger.info("===spotPlanDateList.getJSONObject(j)========="+spotDate);
                        Date spotDay = DateUtil.getDate(spotDate.getString("day"));
                        String spot = spotDate.getString("spot");
                        if (date.equals(DateUtil.getDateStr(spotDay))) {
                            //没有更新
                            if (!dateValue.equalsIgnoreCase(spot)) {
                                //设置新的点位
                                spotDate.put("spot",dateValue);
                                updateBelongs(spotDate);
                            }
                            spotNum += DoubleUtil.getValue(dateValue);
                            existsSalSpotData=true;
                            //匹配上则删除集合
                            spotPlanDateList.remove(j);
                            break;
                        }
                    }
                    //不存在，新增
                    if (!existsSalSpotData){
                        JSONObject spotDate = new JSONObject();
                        spotDate.accumulate("day",date);
                        spotDate.accumulate("spot",dateValue);
                        spotDate.accumulate("spotId",spotId);
                        spotDate.accumulate("contractId",contractId);
                        spotDate.accumulate("meidaId",mediaId);
                        spotDate.accumulate("dimDepart",contract.getString("dimDepart"));
                        createBelongs(spotDateBelongId,spotDate);
                        spotNum += DoubleUtil.getValue(dateValue);
                    }

                    boolean existsMediaSpotData = false;
                    for (int j = 0; j < spotPlanDateList.size(); j++) {
                        JSONObject spotDate = spotPlanDateList.getJSONObject(j);
                        logger.info("===spotPlanDateList.getJSONObject(j)========="+spotDate);
                        Date spotDay = DateUtil.getDate(spotDate.getString("day"));
                        String spot = spotDate.getString("spot");
                        if (date.equals(DateUtil.getDateStr(spotDay))) {
                            //没有更新
                            if (!dateValue.equalsIgnoreCase(spot)) {
                                //设置新的点位
                                spotDate.put("spot",dateValue);
                                updateBelongs(spotDate);
                            }
                            spotNum += DoubleUtil.getValue(dateValue);
                            existsMediaSpotData=true;
                            //匹配上则删除集合
                            spotPlanDateList.remove(j);
                            break;
                        }
                    }

                    //不存在，新增
                    if (!existsMediaSpotData){
                        //在插入purContrantSpotDate的同时往媒体总库中插入输入。
                        JSONObject mediaSpotDate = new JSONObject();
                        mediaSpotDate.accumulate("customItem1",date);
                        mediaSpotDate.accumulate("spot","2");
                        mediaSpotDate.accumulate("meidaID",mediaId);
                        mediaSpotDate.accumulate("contractId",contractId);
                        //在备注中放入合同所有人
                        mediaSpotDate.accumulate("comment",contract.getLong("ownerId"));
                        createBelongs(mediaSpotDate888BelongID,mediaSpotDate);
                    }*/
                }

                //删除本次修改的点位
             /*   for (int j = 0; j < spotPlanDateList.size() ; j++) {
                    JSONObject spotDate = spotPlanDateList.getJSONObject(j);
                    long spotDateId = spotDate.getLong("id");
                    deleteBelongs(spotDateId);
                }*/
                Iterator it = saleContractSpotDateMap.keySet().iterator();
                while(it.hasNext()) {
                    JSONObject spotDate = saleContractSpotDateMap.get(it.next());
                    long spotDateId = spotDate.getLong("id");
                    deleteBelongs(spotDateId);
                }
                if (!hasSpot) {
                    stringBuffer_msg.append("第" + currentRow + "行广告位，必须有点位纪录\n");
//						return getErrorResponse(currentRow, "必须有点位纪录！");
                }

                //自動計算总刊例数、刊例总价、折后总价
                JSONArray spots= getSpot(spotId);

                if (spots!=null&&spots.size()>0){
                    JSONObject spot = spots.getJSONObject(0);
//                    Double retailPrice = spot.getDouble("retailPrice");
                    Double orderPrice = spot.getDouble("orderPrice");
                    spot.put("id",spotId);
                    //日期
                    JSONArray spotDateArray = getSpotDate(spotId);
                    if (spotDateArray!=null&&spotDateArray.size()>0){
                        SimpleDateFormat format = new SimpleDateFormat("yyyy-MM-dd");
                        try {
                            spot.put("startAt",format.parse(spotDateArray.getJSONObject(0).getString("day")).getTime());
                            spot.put("endAt",format.parse(spotDateArray.getJSONObject(spotDateArray.size()-1).getString("day")).getTime());
                        } catch (ParseException e) {
                            e.printStackTrace();
                        }
                    }

                    spot.put("displayQuantity",spotNum);
//                    spot.put("retailPriceTotal",DoubleUtil.mul(spotNum,retailPrice));
                    spot.put("totalOrderAmount",DoubleUtil.mul(spotNum,orderPrice));

                    //自动计算
                    updateBelongs(spot);
                }



            }
        }

        if (!hasSpotItem) {
            stringBuffer_msg.append("没有一条点位记录，请检查！");
        }

        if (stringBuffer_msg.length() > 0) {
            jsonResult.accumulate("message", stringBuffer_msg.toString());
            jsonResult.accumulate("success", false);
            return jsonResult.toString();
        }


        logger.debug("save data:" + (System.currentTimeMillis() - start) + " ms");

        jsonResult.accumulate("message", "保存成功");
        jsonResult.accumulate("success", true);

        return jsonResult.toString();
    }


    /**
     * 获得列配置位置信息
     *
     * @return 列位置：字段名称
     */
    private HashMap<Integer, String> colTempMap() {
        //初始化全部列
        HashMap<Integer, String> colTempMap = new HashMap<Integer, String>(400);
        int dateColumns = 0;
        colTempMap.put(dateColumns++, "uuid");
        List<SpotField> spotFieldList = spotConfig.getSpotFielList();
        for (int i = 0; i < spotFieldList.size(); i++) {
            SpotField spotField = spotFieldList.get(i);
            String fieldName = spotField.getEn();
            //增加列信息
            colTempMap.put(dateColumns++, fieldName);

            //增加日期配置信息
            boolean renderDateColumn = fieldName.equalsIgnoreCase(spotConfig.getShowSpotFieldName());
            if (renderDateColumn) {
                if (startDate != null && endDate != null) {
                    Calendar startCal = Calendar.getInstance();
                    startCal.setTime(startDate);
                    Calendar endCal = Calendar.getInstance();
                    endCal.setTime(endDate);
                    //date_0_2015-01-01
                    endCal.add(Calendar.DATE, 1);//最后日期加一天，便于循环
                    while (startCal.before(endCal)) {
                        String date = DateUtil.getDateStr(startCal.getTime());//String.format("%tF", startCal.getTime());
                        //logger.debug(date+";"+dateColumns+";"+ SheetUtil.indexToColumn(dateColumns));
                        colTempMap.put(dateColumns, date);
                        dateColumns++;
                        startCal.add(Calendar.DATE, 1);//开始日期加1
                    }
                }
            }
        }

        return colTempMap;
    }

    /**
     * 查询排期的点位纪录
     * @return
     */
    private JSONArray getSpotDate(String spotId) {
        StringBuffer sql = new StringBuffer();
        sql.append("select id,day,spot from saleContractSpotDate where spotId=").append(spotId);
        sql.append(" order by day ");
        return queryResultArray( sql.toString());
    }
    //得到销售合同对应的点位数据
    private Map<String,JSONObject> getSalesSpotDateMap(String purContractId) {
        String sql = "select id,day,spot,meidaId,spotId from saleContractSpotDate where contractId = " + purContractId + "";
        JSONArray array = queryAllResult(sql);
        Map<String,JSONObject> result=new HashMap<String,JSONObject>();
        if (array!=null&&array.size()>0){
            for (int i = 0; i < array.size(); i++) {
                JSONObject item = array.getJSONObject(i);
                String day = item.getString("day");
                String date = DateUtil.getDateStr(day);
                String meidaId = item.getString("meidaId");
                result.put(date+"&"+meidaId,item);
            }
        }
        return result;
    }
    private JSONArray getSpot(String spotId) {
        StringBuffer sql = new StringBuffer();
        sql.append("select id,orderPrice from saleContractSpot where id=").append(spotId);
        return queryResultArray( sql.toString());
    }
    private JSONArray getMediaSpot(String mediaId) {
        StringBuffer sql = new StringBuffer();
        sql.append("select id,customItem1,spot,comment from mediaSpotDate888 where meidaID=").append(mediaId);
        return queryResultArray( sql.toString());
    }

    //得到采购合同对应的点位数据
    private Map<String,JSONObject> getMediaSpotDateMap(long  mediaId,  Long beginLong ,  Long endLong ) {
        StringBuffer sql = new StringBuffer();
        sql.append("select id,customItem1,spot from mediaSpotDate888 where meidaID=").append(mediaId);
        sql.append(" and customItem1 >= ").append(beginLong).append(" and customItem1 <= ").append(endLong);
        JSONArray array = queryAllResult(sql.toString());
        Map<String, JSONObject> result = new HashMap<String, JSONObject>();
        if (array != null && array.size() > 0) {
            for (int i = 0; i < array.size(); i++) {
                JSONObject item = array.getJSONObject(i);
                String day = item.getString("customItem1");
                String date = DateUtil.getDateStr(day);
                result.put(date+"&"+String.valueOf(mediaId), item);
            }
        }
        return result;
    }
    public static void main(String[] args) {
        SaleContractSpotSave  saleContractSpotSave=new SaleContractSpotSave();
        com.rkhd.platform.sdk.http.Request rkhdRequest = new com.rkhd.platform.sdk.http.Request();
        rkhdRequest.putParameter("id",new String[]{"618285"});
        rkhdRequest.putParameter("contractId",new String[]{"618285"});
        rkhdRequest.putParameter("startDate",new String[]{"2017-03-21 00: 00"});
        rkhdRequest.putParameter("endDate",new String[]{"2017-03-31 00: 00"});
        rkhdRequest.putParameter("json",new String[]{"{\"name\":\"\\u6392\\u671f\",\"sheets\":[{\"id\":1,\"name\":\"\\u6392\\u671f\",\"actived\":true,\"color\":\"orange\"}],\"cells\":[{\"sheet\":1,\"row\":0,\"col\":1,\"json\":\"{\\\"width\\\":150}\"},{\"sheet\":1,\"row\":0,\"col\":2,\"json\":\"{\\\"width\\\":80}\"},{\"sheet\":1,\"row\":0,\"col\":3,\"json\":\"{\\\"width\\\":80}\"},{\"sheet\":1,\"row\":0,\"col\":4,\"json\":\"{\\\"width\\\":80}\"},{\"sheet\":1,\"row\":0,\"col\":5,\"json\":\"{\\\"width\\\":80}\"},{\"sheet\":1,\"row\":0,\"col\":6,\"json\":\"{\\\"width\\\":80,\\\"fm\\\":\\\"money||2|none\\\"}\"},{\"sheet\":1,\"row\":0,\"col\":7,\"json\":\"{\\\"width\\\":80}\"},{\"sheet\":1,\"row\":0,\"col\":8,\"json\":\"{\\\"width\\\":100,\\\"fm\\\":\\\"money||2|none\\\"}\"},{\"sheet\":1,\"row\":0,\"col\":9,\"json\":\"{\\\"width\\\":100,\\\"fm\\\":\\\"money||2|none\\\"}\"},{\"sheet\":1,\"row\":0,\"col\":10,\"json\":\"{\\\"width\\\":100}\"},{\"sheet\":1,\"row\":0,\"col\":11,\"json\":\"{\\\"width\\\":30}\"},{\"sheet\":1,\"row\":0,\"col\":12,\"json\":\"{\\\"width\\\":30}\"},{\"sheet\":1,\"row\":0,\"col\":13,\"json\":\"{\\\"width\\\":30}\"},{\"sheet\":1,\"row\":0,\"col\":14,\"json\":\"{\\\"width\\\":30}\"},{\"sheet\":1,\"row\":0,\"col\":15,\"json\":\"{\\\"width\\\":30}\"},{\"sheet\":1,\"row\":0,\"col\":16,\"json\":\"{\\\"width\\\":30}\"},{\"sheet\":1,\"row\":0,\"col\":17,\"json\":\"{\\\"width\\\":30}\"},{\"sheet\":1,\"row\":0,\"col\":18,\"json\":\"{\\\"width\\\":30}\"},{\"sheet\":1,\"row\":0,\"col\":19,\"json\":\"{\\\"width\\\":30}\"},{\"sheet\":1,\"row\":0,\"col\":20,\"json\":\"{\\\"width\\\":30}\"},{\"sheet\":1,\"row\":0,\"col\":21,\"json\":\"{\\\"width\\\":30}\"},{\"sheet\":1,\"row\":0,\"col\":22,\"json\":\"{\\\"width\\\":450}\"},{\"sheet\":1,\"row\":2,\"col\":1,\"json\":\"{\\\"data\\\":\\\"Name\\\",\\\"bgc\\\":\\\"#DFE3E8\\\",\\\"ta\\\":\\\"center\\\",\\\"va\\\":\\\"middle\\\",\\\"dsd\\\":\\\"ed\\\"}\"},{\"sheet\":1,\"row\":3,\"col\":1,\"json\":\"{\\\"data\\\":\\\"\\\\u5a92\\\\u4f53\\\\u540d\\\\u79f0\\\",\\\"bgc\\\":\\\"#DFE3E8\\\",\\\"ta\\\":\\\"center\\\",\\\"va\\\":\\\"middle\\\",\\\"dsd\\\":\\\"ed\\\"}\"},{\"sheet\":1,\"row\":2,\"col\":2,\"json\":\"{\\\"data\\\":\\\"Form\\\",\\\"bgc\\\":\\\"#DFE3E8\\\",\\\"ta\\\":\\\"center\\\",\\\"va\\\":\\\"middle\\\",\\\"dsd\\\":\\\"ed\\\"}\"},{\"sheet\":1,\"row\":3,\"col\":2,\"json\":\"{\\\"data\\\":\\\"\\\\u5a92\\\\u4f53\\\\u5f62\\\\u5f0f\\\",\\\"bgc\\\":\\\"#DFE3E8\\\",\\\"ta\\\":\\\"center\\\",\\\"va\\\":\\\"middle\\\",\\\"dsd\\\":\\\"ed\\\"}\"},{\"sheet\":1,\"row\":2,\"col\":3,\"json\":\"{\\\"data\\\":\\\"EntityType\\\",\\\"bgc\\\":\\\"#DFE3E8\\\",\\\"ta\\\":\\\"center\\\",\\\"va\\\":\\\"middle\\\",\\\"dsd\\\":\\\"ed\\\"}\"},{\"sheet\":1,\"row\":3,\"col\":3,\"json\":\"{\\\"data\\\":\\\"\\\\u4e1a\\\\u52a1\\\\u7c7b\\\\u578b\\\",\\\"bgc\\\":\\\"#DFE3E8\\\",\\\"ta\\\":\\\"center\\\",\\\"va\\\":\\\"middle\\\",\\\"dsd\\\":\\\"ed\\\"}\"},{\"sheet\":1,\"row\":2,\"col\":4,\"json\":\"{\\\"data\\\":\\\"OpMode\\\",\\\"bgc\\\":\\\"#DFE3E8\\\",\\\"ta\\\":\\\"center\\\",\\\"va\\\":\\\"middle\\\",\\\"dsd\\\":\\\"ed\\\"}\"},{\"sheet\":1,\"row\":3,\"col\":4,\"json\":\"{\\\"data\\\":\\\"\\\\u7ecf\\\\u8425\\\\u65b9\\\\u5f0f\\\",\\\"bgc\\\":\\\"#DFE3E8\\\",\\\"ta\\\":\\\"center\\\",\\\"va\\\":\\\"middle\\\",\\\"dsd\\\":\\\"ed\\\"}\"},{\"sheet\":1,\"row\":2,\"col\":5,\"json\":\"{\\\"data\\\":\\\"RetailPrice\\\",\\\"bgc\\\":\\\"#DFE3E8\\\",\\\"ta\\\":\\\"center\\\",\\\"va\\\":\\\"middle\\\",\\\"dsd\\\":\\\"ed\\\"}\"},{\"sheet\":1,\"row\":3,\"col\":5,\"json\":\"{\\\"data\\\":\\\"\\\\u520a\\\\u4f8b\\\\u5355\\\\u4ef7\\\",\\\"bgc\\\":\\\"#DFE3E8\\\",\\\"ta\\\":\\\"center\\\",\\\"va\\\":\\\"middle\\\",\\\"dsd\\\":\\\"ed\\\"}\"},{\"sheet\":1,\"row\":2,\"col\":6,\"json\":\"{\\\"data\\\":\\\"OrderPrice\\\",\\\"bgc\\\":\\\"#DFE3E8\\\",\\\"ta\\\":\\\"center\\\",\\\"va\\\":\\\"middle\\\",\\\"dsd\\\":\\\"ed\\\"}\"},{\"sheet\":1,\"row\":3,\"col\":6,\"json\":\"{\\\"data\\\":\\\"\\\\u6298\\\\u540e\\\\u5355\\\\u4ef7\\\",\\\"bgc\\\":\\\"#DFE3E8\\\",\\\"ta\\\":\\\"center\\\",\\\"va\\\":\\\"middle\\\",\\\"dsd\\\":\\\"ed\\\"}\"},{\"sheet\":1,\"row\":2,\"col\":7,\"json\":\"{\\\"data\\\":\\\"TotalNum\\\",\\\"bgc\\\":\\\"#DFE3E8\\\",\\\"ta\\\":\\\"center\\\",\\\"va\\\":\\\"middle\\\",\\\"dsd\\\":\\\"ed\\\"}\"},{\"sheet\":1,\"row\":3,\"col\":7,\"json\":\"{\\\"data\\\":\\\"\\\\u603b\\\\u6295\\\\u653e\\\\u6570\\\",\\\"bgc\\\":\\\"#DFE3E8\\\",\\\"ta\\\":\\\"center\\\",\\\"va\\\":\\\"middle\\\",\\\"dsd\\\":\\\"ed\\\"}\"},{\"sheet\":1,\"row\":2,\"col\":8,\"json\":\"{\\\"data\\\":\\\"TotalRetailAmount\\\",\\\"bgc\\\":\\\"#DFE3E8\\\",\\\"ta\\\":\\\"center\\\",\\\"va\\\":\\\"middle\\\",\\\"dsd\\\":\\\"ed\\\"}\"},{\"sheet\":1,\"row\":3,\"col\":8,\"json\":\"{\\\"data\\\":\\\"\\\\u520a\\\\u4f8b\\\\u603b\\\\u4ef7\\\",\\\"bgc\\\":\\\"#DFE3E8\\\",\\\"ta\\\":\\\"center\\\",\\\"va\\\":\\\"middle\\\",\\\"dsd\\\":\\\"ed\\\"}\"},{\"sheet\":1,\"row\":2,\"col\":9,\"json\":\"{\\\"data\\\":\\\"TotalOrderAmount\\\",\\\"bgc\\\":\\\"#DFE3E8\\\",\\\"ta\\\":\\\"center\\\",\\\"va\\\":\\\"middle\\\",\\\"dsd\\\":\\\"ed\\\"}\"},{\"sheet\":1,\"row\":3,\"col\":9,\"json\":\"{\\\"data\\\":\\\"\\\\u6298\\\\u540e\\\\u603b\\\\u4ef7\\\",\\\"bgc\\\":\\\"#DFE3E8\\\",\\\"ta\\\":\\\"center\\\",\\\"va\\\":\\\"middle\\\",\\\"dsd\\\":\\\"ed\\\"}\"},{\"sheet\":1,\"row\":2,\"col\":10,\"json\":\"{\\\"data\\\":\\\"OnlineTimeArange\\\",\\\"bgc\\\":\\\"#DFE3E8\\\",\\\"ta\\\":\\\"center\\\",\\\"va\\\":\\\"middle\\\",\\\"dsd\\\":\\\"ed\\\"}\"},{\"sheet\":1,\"row\":3,\"col\":10,\"json\":\"{\\\"data\\\":\\\"\\\\u70b9\\\\u4f4d\\\\u4e0a\\\\u7ebf\\\\u65f6\\\\u95f4\\\\u6bb5\\\",\\\"bgc\\\":\\\"#DFE3E8\\\",\\\"ta\\\":\\\"center\\\",\\\"va\\\":\\\"middle\\\",\\\"dsd\\\":\\\"ed\\\"}\"},{\"sheet\":1,\"row\":2,\"col\":11,\"json\":\"{\\\"data\\\":\\\"2017-03-21\\\",\\\"bgc\\\":\\\"#DFE3E8\\\",\\\"ta\\\":\\\"center\\\",\\\"va\\\":\\\"middle\\\",\\\"dsd\\\":\\\"ed\\\",\\\"fm\\\":\\\"date\\\",\\\"dfm\\\":\\\"d\\\"}\"},{\"sheet\":1,\"row\":3,\"col\":11,\"json\":\"{\\\"data\\\":\\\"\\\\u4e8c\\\",\\\"bgc\\\":\\\"#DFE3E8\\\",\\\"ta\\\":\\\"center\\\",\\\"va\\\":\\\"middle\\\",\\\"dsd\\\":\\\"ed\\\"}\"},{\"sheet\":1,\"row\":2,\"col\":12,\"json\":\"{\\\"data\\\":\\\"2017-03-22\\\",\\\"bgc\\\":\\\"#DFE3E8\\\",\\\"ta\\\":\\\"center\\\",\\\"va\\\":\\\"middle\\\",\\\"dsd\\\":\\\"ed\\\",\\\"fm\\\":\\\"date\\\",\\\"dfm\\\":\\\"d\\\"}\"},{\"sheet\":1,\"row\":3,\"col\":12,\"json\":\"{\\\"data\\\":\\\"\\\\u4e09\\\",\\\"bgc\\\":\\\"#DFE3E8\\\",\\\"ta\\\":\\\"center\\\",\\\"va\\\":\\\"middle\\\",\\\"dsd\\\":\\\"ed\\\"}\"},{\"sheet\":1,\"row\":2,\"col\":13,\"json\":\"{\\\"data\\\":\\\"2017-03-23\\\",\\\"bgc\\\":\\\"#DFE3E8\\\",\\\"ta\\\":\\\"center\\\",\\\"va\\\":\\\"middle\\\",\\\"dsd\\\":\\\"ed\\\",\\\"fm\\\":\\\"date\\\",\\\"dfm\\\":\\\"d\\\"}\"},{\"sheet\":1,\"row\":3,\"col\":13,\"json\":\"{\\\"data\\\":\\\"\\\\u56db\\\",\\\"bgc\\\":\\\"#DFE3E8\\\",\\\"ta\\\":\\\"center\\\",\\\"va\\\":\\\"middle\\\",\\\"dsd\\\":\\\"ed\\\"}\"},{\"sheet\":1,\"row\":2,\"col\":14,\"json\":\"{\\\"data\\\":\\\"2017-03-24\\\",\\\"bgc\\\":\\\"#DFE3E8\\\",\\\"ta\\\":\\\"center\\\",\\\"va\\\":\\\"middle\\\",\\\"dsd\\\":\\\"ed\\\",\\\"fm\\\":\\\"date\\\",\\\"dfm\\\":\\\"d\\\"}\"},{\"sheet\":1,\"row\":3,\"col\":14,\"json\":\"{\\\"data\\\":\\\"\\\\u4e94\\\",\\\"bgc\\\":\\\"#DFE3E8\\\",\\\"ta\\\":\\\"center\\\",\\\"va\\\":\\\"middle\\\",\\\"dsd\\\":\\\"ed\\\"}\"},{\"sheet\":1,\"row\":2,\"col\":15,\"json\":\"{\\\"data\\\":\\\"2017-03-25\\\",\\\"bgc\\\":\\\"#DFE3E8\\\",\\\"ta\\\":\\\"center\\\",\\\"va\\\":\\\"middle\\\",\\\"dsd\\\":\\\"ed\\\",\\\"fm\\\":\\\"date\\\",\\\"dfm\\\":\\\"d\\\"}\"},{\"sheet\":1,\"row\":3,\"col\":15,\"json\":\"{\\\"data\\\":\\\"\\\\u516d\\\",\\\"bgc\\\":\\\"#DFE3E8\\\",\\\"color\\\":\\\"#FF0000\\\",\\\"ta\\\":\\\"center\\\",\\\"va\\\":\\\"middle\\\",\\\"dsd\\\":\\\"ed\\\"}\"},{\"sheet\":1,\"row\":2,\"col\":16,\"json\":\"{\\\"data\\\":\\\"2017-03-26\\\",\\\"bgc\\\":\\\"#DFE3E8\\\",\\\"ta\\\":\\\"center\\\",\\\"va\\\":\\\"middle\\\",\\\"dsd\\\":\\\"ed\\\",\\\"fm\\\":\\\"date\\\",\\\"dfm\\\":\\\"d\\\"}\"},{\"sheet\":1,\"row\":3,\"col\":16,\"json\":\"{\\\"data\\\":\\\"\\\\u65e5\\\",\\\"bgc\\\":\\\"#DFE3E8\\\",\\\"color\\\":\\\"#FF0000\\\",\\\"ta\\\":\\\"center\\\",\\\"va\\\":\\\"middle\\\",\\\"dsd\\\":\\\"ed\\\"}\"},{\"sheet\":1,\"row\":2,\"col\":17,\"json\":\"{\\\"data\\\":\\\"2017-03-27\\\",\\\"bgc\\\":\\\"#DFE3E8\\\",\\\"ta\\\":\\\"center\\\",\\\"va\\\":\\\"middle\\\",\\\"dsd\\\":\\\"ed\\\",\\\"fm\\\":\\\"date\\\",\\\"dfm\\\":\\\"d\\\"}\"},{\"sheet\":1,\"row\":3,\"col\":17,\"json\":\"{\\\"data\\\":\\\"\\\\u4e00\\\",\\\"bgc\\\":\\\"#DFE3E8\\\",\\\"ta\\\":\\\"center\\\",\\\"va\\\":\\\"middle\\\",\\\"dsd\\\":\\\"ed\\\"}\"},{\"sheet\":1,\"row\":2,\"col\":18,\"json\":\"{\\\"data\\\":\\\"2017-03-28\\\",\\\"bgc\\\":\\\"#DFE3E8\\\",\\\"ta\\\":\\\"center\\\",\\\"va\\\":\\\"middle\\\",\\\"dsd\\\":\\\"ed\\\",\\\"fm\\\":\\\"date\\\",\\\"dfm\\\":\\\"d\\\"}\"},{\"sheet\":1,\"row\":3,\"col\":18,\"json\":\"{\\\"data\\\":\\\"\\\\u4e8c\\\",\\\"bgc\\\":\\\"#DFE3E8\\\",\\\"ta\\\":\\\"center\\\",\\\"va\\\":\\\"middle\\\",\\\"dsd\\\":\\\"ed\\\"}\"},{\"sheet\":1,\"row\":2,\"col\":19,\"json\":\"{\\\"data\\\":\\\"2017-03-29\\\",\\\"bgc\\\":\\\"#DFE3E8\\\",\\\"ta\\\":\\\"center\\\",\\\"va\\\":\\\"middle\\\",\\\"dsd\\\":\\\"ed\\\",\\\"fm\\\":\\\"date\\\",\\\"dfm\\\":\\\"d\\\"}\"},{\"sheet\":1,\"row\":3,\"col\":19,\"json\":\"{\\\"data\\\":\\\"\\\\u4e09\\\",\\\"bgc\\\":\\\"#DFE3E8\\\",\\\"ta\\\":\\\"center\\\",\\\"va\\\":\\\"middle\\\",\\\"dsd\\\":\\\"ed\\\"}\"},{\"sheet\":1,\"row\":2,\"col\":20,\"json\":\"{\\\"data\\\":\\\"2017-03-30\\\",\\\"bgc\\\":\\\"#DFE3E8\\\",\\\"ta\\\":\\\"center\\\",\\\"va\\\":\\\"middle\\\",\\\"dsd\\\":\\\"ed\\\",\\\"fm\\\":\\\"date\\\",\\\"dfm\\\":\\\"d\\\"}\"},{\"sheet\":1,\"row\":3,\"col\":20,\"json\":\"{\\\"data\\\":\\\"\\\\u56db\\\",\\\"bgc\\\":\\\"#DFE3E8\\\",\\\"ta\\\":\\\"center\\\",\\\"va\\\":\\\"middle\\\",\\\"dsd\\\":\\\"ed\\\"}\"},{\"sheet\":1,\"row\":2,\"col\":21,\"json\":\"{\\\"data\\\":\\\"2017-03-31\\\",\\\"bgc\\\":\\\"#DFE3E8\\\",\\\"ta\\\":\\\"center\\\",\\\"va\\\":\\\"middle\\\",\\\"dsd\\\":\\\"ed\\\",\\\"fm\\\":\\\"date\\\",\\\"dfm\\\":\\\"d\\\"}\"},{\"sheet\":1,\"row\":3,\"col\":21,\"json\":\"{\\\"data\\\":\\\"\\\\u4e94\\\",\\\"bgc\\\":\\\"#DFE3E8\\\",\\\"ta\\\":\\\"center\\\",\\\"va\\\":\\\"middle\\\",\\\"dsd\\\":\\\"ed\\\"}\"},{\"sheet\":1,\"row\":1,\"col\":11,\"json\":\"{\\\"data\\\":\\\"2017-03\\\",\\\"bgc\\\":\\\"#DFE3E8\\\",\\\"ta\\\":\\\"center\\\",\\\"va\\\":\\\"middle\\\",\\\"dsd\\\":\\\"ed\\\"}\"},{\"sheet\":1,\"row\":2,\"col\":22,\"json\":\"{\\\"data\\\":\\\"Address\\\",\\\"bgc\\\":\\\"#DFE3E8\\\",\\\"ta\\\":\\\"center\\\",\\\"va\\\":\\\"middle\\\",\\\"dsd\\\":\\\"ed\\\"}\"},{\"sheet\":1,\"row\":3,\"col\":22,\"json\":\"{\\\"data\\\":\\\"\\\\u8be6\\\\u7ec6\\\\u5730\\\\u5740\\\",\\\"bgc\\\":\\\"#DFE3E8\\\",\\\"ta\\\":\\\"center\\\",\\\"va\\\":\\\"middle\\\",\\\"dsd\\\":\\\"ed\\\"}\"},{\"sheet\":1,\"row\":1,\"col\":1,\"json\":\"{\\\"data\\\":\\\"\\\",\\\"bgc\\\":\\\"#DFE3E8\\\",\\\"ta\\\":\\\"center\\\",\\\"va\\\":\\\"middle\\\",\\\"dsd\\\":\\\"ed\\\"}\"},{\"sheet\":1,\"row\":1,\"col\":22,\"json\":\"{\\\"data\\\":\\\"\\\",\\\"bgc\\\":\\\"#DFE3E8\\\",\\\"ta\\\":\\\"center\\\",\\\"va\\\":\\\"middle\\\",\\\"dsd\\\":\\\"ed\\\"}\"},{\"sheet\":1,\"row\":4,\"col\":0,\"json\":\"{\\\"id\\\":\\\"103145999\\\"}\"},{\"sheet\":1,\"row\":4,\"col\":1,\"json\":\"{\\\"id\\\":\\\"103145989\\\",\\\"data\\\":\\\"\\\\u5eca\\\\u574a\\\\u5b54\\\\u96c0\\\\u57ce\\\\u5c0f\\\\u533a\\\\u5a92\\\\u4f53\\\"}\"},{\"sheet\":1,\"row\":4,\"col\":2,\"json\":\"{\\\"id\\\":\\\"1\\\",\\\"data\\\":\\\"\\\\u7535\\\\u68af\\\\u95e8\\\"}\"},{\"sheet\":1,\"row\":4,\"col\":3,\"json\":\"{\\\"id\\\":\\\"100019327\\\",\\\"data\\\":\\\"\\\\u9ad8\\\\u901f\\\\u5a92\\\\u4f53\\\"}\"},{\"sheet\":1,\"row\":4,\"col\":4,\"json\":\"{\\\"id\\\":\\\"1\\\",\\\"data\\\":\\\"\\\\u81ea\\\\u6709\\\\u5a92\\\\u4f53\\\"}\"},{\"sheet\":1,\"row\":4,\"col\":5,\"json\":\"{\\\"data\\\":\\\"200\\\"}\"},{\"sheet\":1,\"row\":4,\"col\":6,\"json\":\"{\\\"data\\\":\\\"200\\\"}\"},{\"sheet\":1,\"row\":4,\"col\":7,\"cal\":true,\"json\":\"{\\\"data\\\":\\\"=SUM(K4:U4)\\\",\\\"cal\\\":true,\\\"ta\\\":\\\"right\\\",\\\"va\\\":\\\"middle\\\",\\\"fm\\\":\\\"money||0|negative1\\\",\\\"dsd\\\":\\\"ed\\\",\\\"arg\\\":\\\"SUM({\\\\\\\"span\\\\\\\":[\\\\\\\"\\\\\\\",0,4,0,14],\\\\\\\"type\\\\\\\":2})\\\",\\\"refs\\\":[[1,4,11,4,21]],\\\"timestamp\\\":\\\"20170320134005338\\\",\\\"lastVal\\\":2,\\\"value\\\":3}\"},{\"sheet\":1,\"row\":4,\"col\":8,\"cal\":true,\"json\":\"{\\\"data\\\":\\\"=G4*E4\\\",\\\"cal\\\":true,\\\"ta\\\":\\\"right\\\",\\\"va\\\":\\\"middle\\\",\\\"fm\\\":\\\"money||0|negative1\\\",\\\"dsd\\\":\\\"ed\\\",\\\"arg\\\":\\\"overwritemultiple({\\\\\\\"span\\\\\\\":[\\\\\\\"\\\\\\\",0,-1,0,-1],\\\\\\\"type\\\\\\\":2},{\\\\\\\"span\\\\\\\":[\\\\\\\"\\\\\\\",0,-3,0,-3],\\\\\\\"type\\\\\\\":2})\\\",\\\"refs\\\":[[1,4,7,4,7],[1,4,5,4,5]],\\\"timestamp\\\":\\\"20170320134005338\\\",\\\"lastVal\\\":400,\\\"value\\\":600}\"},{\"sheet\":1,\"row\":4,\"col\":9,\"cal\":true,\"json\":\"{\\\"data\\\":\\\"=G4*F4\\\",\\\"cal\\\":true,\\\"ta\\\":\\\"right\\\",\\\"va\\\":\\\"middle\\\",\\\"fm\\\":\\\"money||0|negative1\\\",\\\"dsd\\\":\\\"ed\\\",\\\"arg\\\":\\\"overwritemultiple({\\\\\\\"span\\\\\\\":[\\\\\\\"\\\\\\\",0,-2,0,-2],\\\\\\\"type\\\\\\\":2},{\\\\\\\"span\\\\\\\":[\\\\\\\"\\\\\\\",0,-3,0,-3],\\\\\\\"type\\\\\\\":2})\\\",\\\"refs\\\":[[1,4,7,4,7],[1,4,6,4,6]],\\\"timestamp\\\":\\\"20170320134005338\\\",\\\"lastVal\\\":400,\\\"value\\\":600}\"},{\"sheet\":1,\"row\":4,\"col\":11,\"json\":\"{\\\"data\\\":\\\"1\\\",\\\"bgc\\\":\\\"#87cefa\\\",\\\"timestamp\\\":\\\"20170320134003479\\\"}\"},{\"sheet\":1,\"row\":4,\"col\":12,\"json\":\"{\\\"data\\\":\\\"1\\\",\\\"bgc\\\":\\\"#87cefa\\\",\\\"timestamp\\\":\\\"20170320134004333\\\"}\"},{\"sheet\":1,\"row\":4,\"col\":13,\"json\":\"{\\\"data\\\":\\\"1\\\",\\\"bgc\\\":\\\"#87cefa\\\",\\\"timestamp\\\":\\\"20170320134005338\\\"}\"},{\"sheet\":1,\"row\":4,\"col\":14,\"json\":\"{\\\"data\\\":\\\"\\\",\\\"bgc\\\":\\\"#87cefa\\\"}\"},{\"sheet\":1,\"row\":4,\"col\":15,\"json\":\"{\\\"data\\\":\\\"\\\",\\\"bgc\\\":\\\"#87cefa\\\"}\"},{\"sheet\":1,\"row\":4,\"col\":16,\"json\":\"{\\\"data\\\":\\\"\\\",\\\"bgc\\\":\\\"#87cefa\\\"}\"},{\"sheet\":1,\"row\":4,\"col\":17,\"json\":\"{\\\"data\\\":\\\"\\\",\\\"bgc\\\":\\\"#87cefa\\\"}\"},{\"sheet\":1,\"row\":4,\"col\":18,\"json\":\"{\\\"data\\\":\\\"\\\",\\\"bgc\\\":\\\"#87cefa\\\"}\"},{\"sheet\":1,\"row\":4,\"col\":19,\"json\":\"{\\\"data\\\":\\\"\\\",\\\"bgc\\\":\\\"#87cefa\\\"}\"},{\"sheet\":1,\"row\":4,\"col\":20,\"json\":\"{\\\"data\\\":\\\"\\\",\\\"bgc\\\":\\\"#87cefa\\\"}\"},{\"sheet\":1,\"row\":4,\"col\":21,\"json\":\"{\\\"data\\\":\\\"\\\",\\\"bgc\\\":\\\"#87cefa\\\"}\"},{\"sheet\":1,\"row\":4,\"col\":22,\"json\":\"{\\\"data\\\":\\\"\\\\u6cb3\\\\u5317\\\\u7701\\\\u5eca\\\\u574a\\\\u5e02\\\\u5b54\\\\u96c0\\\\u57ce\\\"}\"},{\"sheet\":0,\"row\":1,\"col\":1,\"json\":\"{\\\"data\\\":\\\"\\\",\\\"timestamp\\\":\\\"20170320133955797\\\"}\"},{\"sheet\":1,\"row\":0,\"col\":0,\"json\":\"{\\\"config\\\":\\\"{\\\\\\\"rangeInfo\\\\\\\":{\\\\\\\"ulefter\\\\\\\":{\\\\\\\"visible\\\\\\\":false},\\\\\\\"slefter\\\\\\\":{\\\\\\\"visible\\\\\\\":true,\\\\\\\"range\\\\\\\":{\\\\\\\"rowStart\\\\\\\":1,\\\\\\\"rowEnd\\\\\\\":0,\\\\\\\"colStart\\\\\\\":0,\\\\\\\"colEnd\\\\\\\":0},\\\\\\\"rowBound\\\\\\\":{\\\\\\\"low\\\\\\\":1,\\\\\\\"min\\\\\\\":1,\\\\\\\"high\\\\\\\":false},\\\\\\\"colBound\\\\\\\":{\\\\\\\"low\\\\\\\":0,\\\\\\\"min\\\\\\\":0,\\\\\\\"high\\\\\\\":true}},\\\\\\\"lheader\\\\\\\":{\\\\\\\"visible\\\\\\\":false},\\\\\\\"sheader\\\\\\\":{\\\\\\\"visible\\\\\\\":true,\\\\\\\"range\\\\\\\":{\\\\\\\"rowStart\\\\\\\":0,\\\\\\\"rowEnd\\\\\\\":0,\\\\\\\"colStart\\\\\\\":1,\\\\\\\"colEnd\\\\\\\":0},\\\\\\\"rowBound\\\\\\\":{\\\\\\\"low\\\\\\\":0,\\\\\\\"min\\\\\\\":0,\\\\\\\"high\\\\\\\":true},\\\\\\\"colBound\\\\\\\":{\\\\\\\"low\\\\\\\":1,\\\\\\\"min\\\\\\\":1,\\\\\\\"high\\\\\\\":false}},\\\\\\\"ltregion\\\\\\\":{\\\\\\\"visible\\\\\\\":false},\\\\\\\"tregion\\\\\\\":{\\\\\\\"visible\\\\\\\":false},\\\\\\\"lregion\\\\\\\":{\\\\\\\"visible\\\\\\\":false},\\\\\\\"cregion\\\\\\\":{\\\\\\\"visible\\\\\\\":true,\\\\\\\"range\\\\\\\":{\\\\\\\"rowStart\\\\\\\":1,\\\\\\\"rowEnd\\\\\\\":0,\\\\\\\"colStart\\\\\\\":1,\\\\\\\"colEnd\\\\\\\":0},\\\\\\\"rowBound\\\\\\\":{\\\\\\\"low\\\\\\\":1,\\\\\\\"min\\\\\\\":1,\\\\\\\"high\\\\\\\":false},\\\\\\\"colBound\\\\\\\":{\\\\\\\"low\\\\\\\":1,\\\\\\\"min\\\\\\\":1,\\\\\\\"high\\\\\\\":false}}},\\\\\\\"selection\\\\\\\":{\\\\\\\"startPos\\\\\\\":{\\\\\\\"row\\\\\\\":1,\\\\\\\"col\\\\\\\":1},\\\\\\\"endPos\\\\\\\":{\\\\\\\"row\\\\\\\":1,\\\\\\\"col\\\\\\\":10}},\\\\\\\"focusCell\\\\\\\":{\\\\\\\"row\\\\\\\":1,\\\\\\\"col\\\\\\\":1},\\\\\\\"noGridLine\\\\\\\":false}\\\"}\"}],\"floatings\":[{\"sheet\":1,\"name\":\"2017-03\",\"ftype\":\"meg\",\"json\":\" [1,11,1,21]\",\"jsonObj\":[1,11,1,21]},{\"sheet\":1,\"name\":\"beforeHead\",\"ftype\":\"meg\",\"json\":\" [1,1,1,10]\",\"jsonObj\":[1,1,1,10]},{\"sheet\":1,\"name\":\"afterHead\",\"ftype\":\"meg\",\"json\":\" [1,22,1,22]\",\"jsonObj\":[1,22,1,22]},{\"sheet\":1,\"name\":\"colGroups\",\"ftype\":\"colgroup\",\"json\":\" [{\\\"level\\\":1,\\\"span\\\":[11,21]}]\"},{\"sheet\":1,\"name\":\"1$1$11$1$21\",\"ftype\":\"meg\",\"json\":\"[1,11,1,21]\",\"jsonObj\":[1,11,1,21]},{\"sheet\":1,\"name\":\"1$1$1$1$10\",\"ftype\":\"meg\",\"json\":\"[1,1,1,10]\",\"jsonObj\":[1,1,1,10]},{\"sheet\":1,\"name\":\"1$1$22$1$22\",\"ftype\":\"meg\",\"json\":\"[1,22,1,22]\",\"jsonObj\":[1,22,1,22]}],\"fileConfig\":[]}"});

        //返回的结果
        String json = saleContractSpotSave.execute(rkhdRequest,null,null);

        String newJson = JSONUtil.string2Json(json);
       System.out.println("返回newJson==="+newJson);
    }

}
