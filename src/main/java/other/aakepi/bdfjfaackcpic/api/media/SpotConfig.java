package other.aakepi.bdfjfaackcpic.api.media;

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


    private List<SpotField> spotFielList= new ArrayList<SpotField>();

    public SpotConfig(JSONObject belongsDes){
        this.belongsDes = belongsDes;
        if (belongsDes.containsKey("fields")) {
            this.fieldsArray = belongsDes.getJSONArray("fields");
        }

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

        //中文名称、字段配置类型
        JSONObject fieldObj = getFieldObj(fieldName);
        if (fieldObj != null){
            spotField.setZn(fieldObj.getString("label"));
            spotField.setType(fieldObj.getString("type"));
        }

        spotFielList.add(spotField);
    }

    /**
     * 获得字段配置属性
     * @param fieldName
     * @return
     */
    private JSONObject getFieldObj(String fieldName){
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
            String fieldName = spotField.getEn();
            sql.append(spotField.getEn());
            if (i!=spotFielList.size()-1){
                sql.append(",");
            }
        }
        return sql.toString();
    }
}
