package other.aakepi.bdfjfaackcpic.api.media;

import com.rkhd.platform.sdk.http.Request;
import net.sf.json.JSONArray;
import net.sf.json.JSONObject;
import org.apache.commons.lang.StringUtils;
import other.aakepi.bdfjfaackcpic.api.BaseApiSupport;
import other.aakepi.bdfjfaackcpic.api.QueryResult;
import other.aakepi.bdfjfaackcpic.config.SpotConfig;
import other.aakepi.bdfjfaackcpic.config.SpotField;
import other.aakepi.bdfjfaackcpic.util.DateUtil;

import java.text.SimpleDateFormat;
import java.util.*;

/**
 * 排期查询基础对象
 * Created by yangyixin on 16/10/8.
 */
public abstract class BaseSpotSearch extends BaseApiSupport {

    //request请求
    protected Request request;
    //全部实体信息
    protected QueryResult allBelongs;
    //媒体对象的ID
    protected long mediaBelongId;
    //媒体：字段描述
    protected JSONObject mediaBelongsDes;
    //媒体：下拉选项
    protected Map<String, Map<Object, String>> mediaSelectMap;
    //排期显示配置对象
    protected  SpotConfig spotConfig;

    /**
     * 初始化Request
     * @param request
     */
    protected void initRequest(Request request){
        this.request=request;
    }
    /**
     * 初始化
     *
     */
    protected void initParam() {
        //查询全部实体，获得对应的belongId：
        allBelongs = getAllBelongs(request);
        //媒体对象的ID
        mediaBelongId = getBelongId(allBelongs, "media");
        //字段描述
        mediaBelongsDes = getBelongsDesc(request, mediaBelongId);
        //下拉选项
        mediaSelectMap = getBelongSelectItem(mediaBelongsDes);
        //排期配置对象
        spotConfig = new SpotConfig(mediaBelongsDes);

        initSpotConfig();
    }

    /**
     * 初始化排期配置信息
     */
    protected abstract  void initSpotConfig() ;


    /**
     * 获得sheet显示的Json对象
     *
     * @return
     */
    protected JSONObject sheet(Date startDate,  Date endDate, String sheetStr) {
        long start = System.currentTimeMillis();
        int sheetId = 1;
        if (StringUtils.isNotEmpty(sheetStr)) {
            sheetId = Integer.valueOf(sheetStr);
        }
        String sheetName = "排期";

        ArrayList<HashMap<String, String>> columns = new ArrayList<HashMap<String, String>>();

        List<SpotField> spotFieldList = spotConfig.getSpotFielList();
        for (int i = 0; i < spotFieldList.size(); i++) {
            HashMap<String, String> col = getCol(spotFieldList.get(i));
            columns.add(col);
        }
//        columns.add(getCol("Media","媒体名称","150",null));
//        columns.add(getCol("EntityType","业务类型","80",null));
//        columns.add(getCol("OpMode","经营方式","80",null));
//        columns.add(getCol("SaleStatus","销售状态","80",null));
//        columns.add(getCol("Address","地址","150",null));
//        columns.add(getCol("RetailPrice/day","刊例价","100"," fm: \"money||2|none\""));
//        columns.add(getCol("Owner","所有者","80",null));


        JSONObject jsonResult = new JSONObject();
        JSONArray headData = new JSONArray();
        JSONArray floatingArray = new JSONArray();
        JSONArray widthArray = new JSONArray();
        JSONArray titleArray = new JSONArray();
        JSONArray groupArray = new JSONArray();
        int columnSize = columns.size();//列数
        int dateColumns = 0;//点位列数
        int firstSpotColumnIndex = 0;//排期点位列号

        SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");
        int spotEndCol = 7;//排期点位结束位置；
        try {
            for (int i = 0; i < columns.size(); i++) {
                HashMap<String, String> col = columns.get(i);
                String name_en = col.get("en");
                String name_zh = col.get("zh");

                JSONObject colJObj = new JSONObject();
                String width = col.get("width");
                String other = col.get("other");

                if (StringUtils.isNotBlank(width)) {
                    JSONObject widthJson = new JSONObject();
                    widthJson.accumulate("sheet", sheetId);
                    widthJson.accumulate("row", 0);
                    widthJson.accumulate("col", i + 1 + dateColumns);//加上日期点位数
                    String otherStr = "";
                    if (StringUtils.isNotBlank(other)) {
                        otherStr = "," + other;
                    }
                    widthJson.accumulate("json", "{width:" + Integer.parseInt(width) + otherStr + "}");

                    widthArray.add(widthJson);
                }
                JSONObject titleJsonEn = new JSONObject();
                titleJsonEn.accumulate("sheet", sheetId);
                titleJsonEn.accumulate("row", 2);
                titleJsonEn.accumulate("col", i + 1 + dateColumns);
                titleJsonEn.accumulate("json", "{data: '" + name_en + "', bgc: '#DFE3E8', ta: 'center', va: 'middle', dsd: 'ed'} ");
                titleArray.add(titleJsonEn);

                JSONObject titleJson = new JSONObject();
                titleJson.accumulate("sheet", sheetId);
                titleJson.accumulate("row", 3);
                titleJson.accumulate("col", i + 1 + dateColumns);
                titleJson.accumulate("json", "{data: '" + name_zh + "', bgc: '#DFE3E8', ta: 'center', va: 'middle', dsd: 'ed'} ");
                titleArray.add(titleJson);

                int lastSpotColumn = i + 1;//日期前一列

                //全部字段后显示点位：
                boolean renderDateColumn = name_en.equalsIgnoreCase(spotConfig.getShowSpotFieldName());
                if (renderDateColumn) {
                    firstSpotColumnIndex = lastSpotColumn;//记住这个位置，便于外面合并

                    if (startDate != null && endDate != null) {
                        Calendar startCal = Calendar.getInstance(Locale.SIMPLIFIED_CHINESE);
                        startCal.setTime(startDate);
                        Calendar endCal = Calendar.getInstance(Locale.SIMPLIFIED_CHINESE);
                        endCal.setTime(endDate);
                        int endDateMonth = endCal.get(Calendar.MONTH);
                        endCal.add(Calendar.DATE, 1);//最后日期加一天，便于循环
                        int monthStartCol = lastSpotColumn + 1;
                        int previousMonth = startCal.get(Calendar.MONTH);
                        String previousMonthName = String.format("%tY-%tm", startCal.getTime(), startCal.getTime());
                        boolean crossMonth = false;//是否跨月
                        while (startCal.before(endCal)) {
                            dateColumns++;

                            //设置排期点位宽度
                            JSONObject widthJson = new JSONObject();
                            widthJson.accumulate("sheet", sheetId);
                            widthJson.accumulate("row", 0);
                            widthJson.accumulate("col", lastSpotColumn + dateColumns);
                            widthJson.accumulate("json", "{width:30}");
                            widthArray.add(widthJson);

                            String month = String.format("%tY-%tm", startCal.getTime(), startCal.getTime());

                            String date = sdf.format(startCal.getTime());
                            String week = StringUtils.substring(String.format(Locale.SIMPLIFIED_CHINESE, "%ta", startCal.getTime()), 2);
//              log.infov("month:{0}", month);
//              log.infov("date:{0}", date);
//              log.infov("week:{0}", week);

                            //分别添加点位的日期和星期
                            JSONObject dateJson = new JSONObject();
                            dateJson.accumulate("sheet", sheetId);
                            dateJson.accumulate("row", 2);
                            dateJson.accumulate("col", lastSpotColumn + dateColumns);
                            dateJson.accumulate("json", "{data: '" + date + "', bgc: '#DFE3E8', ta: 'center', va: 'middle', dsd: 'ed',fm:'date',dfm:'d'} ");
                            titleArray.add(dateJson);

                            JSONObject dateWeekJson = new JSONObject();
                            dateWeekJson.accumulate("sheet", sheetId);
                            dateWeekJson.accumulate("row", 3);
                            dateWeekJson.accumulate("col", lastSpotColumn + dateColumns);
                            if ("六".equals(week) || "日".equals(week)) {
                                dateWeekJson.accumulate("json", "{data: '" + week + "', bgc: '#DFE3E8', color:'#FF0000', ta: 'center', va: 'middle', dsd: 'ed'} ");
                            } else {
                                dateWeekJson.accumulate("json", "{data: '" + week + "', bgc: '#DFE3E8', ta: 'center', va: 'middle', dsd: 'ed'} ");
                            }
                            titleArray.add(dateWeekJson);

                            //当前循环已到达下一个月
                            if (startCal.get(Calendar.MONTH) != previousMonth) {
                                crossMonth = true;//标识跨月
                                //添加合并信息
                                JSONObject monthMergeJson = new JSONObject();
                                monthMergeJson.accumulate("sheet", sheetId);
                                monthMergeJson.accumulate("name", previousMonthName);
                                monthMergeJson.accumulate("ftype", "meg");
                                monthMergeJson.accumulate("json", " [1," + (monthStartCol) + ",1," + (lastSpotColumn + dateColumns - 1) + "]");
//								System.out.println(monthMergeJson);
                                floatingArray.add(monthMergeJson);

                                JSONObject groupJson = new JSONObject();
//								groupJson.accumulate("dir","col");
//								groupJson.accumulate("start", monthStartCol);
//								groupJson.accumulate("end", (lastSpotColumn + dateColumns-1));

                                groupJson.accumulate("level", 1);
                                groupJson.accumulate("span", "[" + monthStartCol + "," + (lastSpotColumn + dateColumns - 1) + "]");
//								groupJson.accumulate("end", );
                                groupArray.add(groupJson);


                                //添加合并格内容
                                JSONObject monthJson = new JSONObject();
                                monthJson.accumulate("sheet", sheetId);
                                monthJson.accumulate("row", 1);
                                monthJson.accumulate("col", (monthStartCol));
                                monthJson.accumulate("json", "{data: '" + previousMonthName + "', bgc: '#DFE3E8', ta: 'center', va: 'middle', dsd: 'ed'} ");
                                titleArray.add(monthJson);

                                //步长增加
                                monthStartCol = lastSpotColumn + dateColumns;
                                previousMonth = startCal.get(Calendar.MONTH);
                                previousMonthName = String.format("%tY-%tm", startCal.getTime(), startCal.getTime());
                            }

                            startCal.add(Calendar.DATE, 1);//开始日期加1

                        }
                        spotEndCol = lastSpotColumn + dateColumns;
                        //遍历月份
                        Calendar startMonth = Calendar.getInstance(Locale.SIMPLIFIED_CHINESE);
                        startMonth.setTime(startDate);
                        Calendar endMonth = Calendar.getInstance(Locale.SIMPLIFIED_CHINESE);
                        endMonth.setTime(endDate);

                        //本月内的合并
                        if (endDateMonth == previousMonth) {
                            //添加合并信息
                            if (monthStartCol != lastSpotColumn + dateColumns) {
                                JSONObject monthMergeJson = new JSONObject();
                                monthMergeJson.accumulate("sheet", sheetId);
                                monthMergeJson.accumulate("name", previousMonthName);
                                monthMergeJson.accumulate("ftype", "meg");
                                monthMergeJson.accumulate("json", " [1," + (crossMonth ? (monthStartCol) : monthStartCol) + ",1," + (lastSpotColumn + dateColumns) + "]");
                                floatingArray.add(monthMergeJson);
                                JSONObject groupJson = new JSONObject();
                                groupJson.accumulate("level", 1);
                                groupJson.accumulate("span", "[" + monthStartCol + "," + (lastSpotColumn + dateColumns) + "]");

//								groupJson.accumulate("dir","col");
//								groupJson.accumulate("start", monthStartCol);
//								groupJson.accumulate("end", (lastSpotColumn + dateColumns));
                                groupArray.add(groupJson);
                            }

                            //添加合并格内容
                            JSONObject monthJson = new JSONObject();
                            monthJson.accumulate("sheet", sheetId);
                            monthJson.accumulate("row", 1);
                            monthJson.accumulate("col", crossMonth ? (monthStartCol) : monthStartCol);
                            monthJson.accumulate("json", "{data: '" + previousMonthName + "', bgc: '#DFE3E8', ta: 'center', va: 'middle', dsd: 'ed'} ");
                            titleArray.add(monthJson);
                        }
                    }
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        //处理第一行的点位前的合并头--begin
        JSONObject mergeBeforeHeadJson = new JSONObject();
        mergeBeforeHeadJson.accumulate("sheet", sheetId);
        mergeBeforeHeadJson.accumulate("name", "beforeHead");
        mergeBeforeHeadJson.accumulate("ftype", "meg");
        mergeBeforeHeadJson.accumulate("json", " [1,1,1," + firstSpotColumnIndex + "]");
        floatingArray.add(mergeBeforeHeadJson);
        //添加空合并格内容
        JSONObject mergeBeforeJson = new JSONObject();
        mergeBeforeJson.accumulate("sheet", sheetId);
        mergeBeforeJson.accumulate("row", 1);
        mergeBeforeJson.accumulate("col", 1);
        mergeBeforeJson.accumulate("json", "{data: '', bgc: '#DFE3E8', ta: 'center', va: 'middle', dsd: 'ed'} ");
        titleArray.add(mergeBeforeJson);
        //处理第一行的点位前的合并头--end

        //处理第一行的点位后的合并头--begin
        JSONObject mergeAfterHeadJson = new JSONObject();
        mergeAfterHeadJson.accumulate("sheet", sheetId);
        mergeAfterHeadJson.accumulate("name", "afterHead");
        mergeAfterHeadJson.accumulate("ftype", "meg");
        mergeAfterHeadJson.accumulate("json", " [1," + (firstSpotColumnIndex + dateColumns + 1) + ",1," + (columnSize + dateColumns) + "]");
        floatingArray.add(mergeAfterHeadJson);
        if (groupArray.size() > 0) {
            JSONObject group = new JSONObject();
            group.accumulate("sheet", sheetId);
            group.accumulate("name", "colGroups");
            group.accumulate("ftype", "colgroup");
            //System.out.println(groupArray.toString());
            group.accumulate("json", " " + groupArray);
            floatingArray.add(group);
        }


        //添加空合并格内容
        JSONObject mergeAfterJson = new JSONObject();
        mergeAfterJson.accumulate("sheet", sheetId);
        mergeAfterJson.accumulate("row", 1);
        mergeAfterJson.accumulate("col", (firstSpotColumnIndex + dateColumns + 1));
        mergeAfterJson.accumulate("json", "{data: '', bgc: '#DFE3E8', ta: 'center', va: 'middle', dsd: 'ed'} ");
        titleArray.add(mergeAfterJson);
        //处理第一行的点位后的合并头--end

        JSONArray sheetsHead = new JSONArray();
        JSONObject sheetsJson = new JSONObject();
        sheetsJson.accumulate("id", sheetId);
        sheetsJson.accumulate("name", sheetName);
        sheetsJson.accumulate("actived", true);
        sheetsJson.accumulate("color", "orange");
        sheetsHead.add(sheetsJson);

        //组装所有的列头
        headData.addAll(widthArray);
        headData.addAll(titleArray);


        //加载媒体的数据：
        JSONArray cellArray = getMediaSpotCellData(0, 300, sheetId);
        if (cellArray!=null){
            headData.addAll(cellArray);
        }

        jsonResult.accumulate("page", 0);//当前页

//    log.info(titleArray);
        jsonResult.accumulate("fileName", sheetName);
        jsonResult.accumulate("sheets", sheetsHead);
        jsonResult.accumulate("floatings", floatingArray);
        jsonResult.accumulate("spotEndCol", spotEndCol);
//    log.info(floatingArray);
        jsonResult.accumulate("cells", headData);

        jsonResult.accumulate("groups", groupArray);
        jsonResult.accumulate("columnSize", columnSize + dateColumns);

        long end = System.currentTimeMillis() - start;
        logger.debug("load sheet time :" + end + " ms");

        return jsonResult;
    }


    /**
     * 获得媒体和广告位数据
     */
    protected abstract JSONArray  getMediaSpotCellData(int first, int size, int sheetId) ;

    /**
     * 获得列配置
     *
     * @param spotField
     * @return
     */
    private HashMap<String, String> getCol(SpotField spotField) {
        String enName = spotField.getEn();
        enName = enName.substring(0, 1).toUpperCase() + enName.substring(1);
        String zhName = spotField.getZn();
        String width = String.valueOf(spotField.getWidth());
        String other = spotField.getOther();
        return getCol(enName, zhName, width, other);
    }

    /**
     * 获得列配置
     *
     * @param enName
     * @param zhName
     * @param width
     * @param other
     * @return
     */
    private HashMap<String, String> getCol(String enName, String zhName, String width, String other) {
        HashMap<String, String> colMap = new HashMap<String, String>();
        colMap.put("en", enName);
        colMap.put("zh", zhName);
        colMap.put("width", width);
        if (StringUtils.isNotBlank(other)) {
            colMap.put("other", other);
        }
        return colMap;
    }

    /**
     * 获得值列表
     *
     * @param fieldName 字段名称
     * @param value     值
     * @return
     */
    private String getSelectLabel(String fieldName, Object value) {
        String label = "";
        if (mediaSelectMap.containsKey(fieldName)) {
            Map<Object, String> selectMap = mediaSelectMap.get(fieldName);
            String lableName = selectMap.get(value);
            return StringUtils.defaultIfEmpty(lableName, "");
        }
        return label;
    }

    /**
     * 获得排期Cell对象
     * @param sheetId
     * @param row
     * @param col
     * @param record
     * @param fieldName
     * @return
     */
    protected JSONObject getColItemSelect(Integer sheetId, int row, int col, JSONObject record, String fieldName) {
        Object fieldValue=record.get(fieldName);
        String selectLabel = getSelectLabel(fieldName, fieldValue);
        return getColItemIdValue(sheetId, row, col,fieldValue,selectLabel);
    }

    /**
     * 获得排期Cell对象
     * @param sheetId
     * @param row
     * @param col
     * @param id
     * @param data
     * @return
     */
    protected JSONObject getColItemIdValue(Integer sheetId, int row, int col, Object id, Object data) {

        JSONObject cols = getItemObject(sheetId, row, col);
        cols.accumulate("json", "{id:\"" +convertObject(id)  + "\",data: \"" + convertObject(data) + "\" }");
        return cols;
    }

    /**
     * 获得排期Cell对象
     * @param sheetId
     * @param row
     * @param col
     * @param value
     * @return
     */
    protected JSONObject getColItemObject(Integer sheetId, int row, int col, Object value) {
        JSONObject cols = getItemObject(sheetId, row, col);
        cols.accumulate("json", "{data: \"" + convertObject(value) + "\" }");
        return cols;
    }

    /**
     * 获得排期Cell对象
     * @param sheetId
     * @param startRow
     * @param col
     * @return
     */
    protected JSONObject getItemObject(Integer sheetId, int startRow, int col) {
        JSONObject itemObj = new JSONObject();
        itemObj.accumulate("sheet", sheetId);
        itemObj.accumulate("row", startRow);
        itemObj.accumulate("col", col);

        return itemObj;
    }

    /**
     * 获得排期Cell对象
     * @param startRow
     * @param col
     * @return
     */
    protected JSONObject getItemObject(int startRow, int col) {
        JSONObject itemObj = new JSONObject();
        itemObj.accumulate("sheet", 1);
        itemObj.accumulate("row", startRow);
        itemObj.accumulate("col", col);

        return itemObj;
    }

}
