package other.aakepi.bdfjfaackcpic.config;

import net.sf.json.JSONArray;
import net.sf.json.JSONObject;

import java.util.ArrayList;
import java.util.List;

/**
 * 排期配置文件
 * Created by yangyixin on 16/10/5.
 */
public class SpotConfig {

    /**
     * 字段描述
     */
    private JSONObject belongsDes;

    /**
     * 字段配置属性
     */
    private JSONArray fieldsArray;

    /**
     * 在那个字段后显示点位
     */
    private String showSpotFieldName;


    private List<SpotField> spotFielList= new ArrayList<SpotField>();

    public SpotConfig(JSONObject belongsDes){
        this.belongsDes = belongsDes;
        if (belongsDes.containsKey("fields")) {
            this.fieldsArray = belongsDes.getJSONArray("fields");
        }
    }

    public String getShowSpotFieldName() {
        return showSpotFieldName;
    }

    public void setShowSpotFieldName(String showSpotFieldName) {
        this.showSpotFieldName = showSpotFieldName;
    }

    /**
     * 添加配置字段
     * @param fieldName
     * @param width
     * @param other
     */
    public void addField(String fieldName,int width,String other){
        SpotField spotField  = new SpotField();
        spotField.setEn(fieldName);
        spotField.setWidth(width);
        spotField.setOther(other);
        spotField.setIsMediaField(true);

        //中文名称、字段配置类型
        JSONObject fieldObj = getFieldObj(fieldName);
        if (fieldObj != null){
            spotField.setZn(fieldObj.getString("label"));
            spotField.setType(fieldObj.getString("type"));
        }

        spotFielList.add(spotField);
    }

    /**
     * 添加配置字段,不是媒体的字段
     * @param fieldName
     * @param zhName
     * @param width
     * @param other
     */
    public void addFieldNotMedia(String fieldName,String zhName,int width,String other){
        SpotField spotField  = new SpotField();
        spotField.setEn(fieldName);
        spotField.setZn(zhName);
        spotField.setWidth(width);
        spotField.setOther(other);
        spotField.setIsMediaField(false);

        spotFielList.add(spotField);
    }
    /**
     * 获得字段配置属性
     * @param fieldName
     * @return
     */
    private JSONObject getFieldObj(String fieldName){
        if (fieldsArray==null) return null;
        for (int i = 0; i < fieldsArray.size() ; i++) {
            JSONObject fieldObj = fieldsArray.getJSONObject(i);
            if (fieldName.equalsIgnoreCase(fieldObj.getString("propertyname"))){
                return fieldObj;
            }
        }
        return null;
    }


    public List<SpotField> getSpotFielList() {
        return spotFielList;
    }

    /**
     * 返回sql语句，不包含id
     * @return
     */
    public String getSql(){
        StringBuffer sql = new StringBuffer();

        for (int i = 0; i < spotFielList.size(); i++) {
            SpotField spotField = spotFielList.get(i);
            if (spotField.isMediaField()){
                String fieldName = spotField.getEn();
                sql.append(",").append(spotField.getEn());
            }
        }
        return sql.toString();
    }


    /**
     * 获得第一列字段名称
     * @return
     */
    public String getFistFieldName(){
       return spotFielList.get(0).getEn();
    }
}
