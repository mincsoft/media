package other.aakepi.bdfjfaackcpic.trigger.media;

import com.rkhd.platform.sdk.ScriptTrigger;
import com.rkhd.platform.sdk.exception.ScriptBusinessException;
import com.rkhd.platform.sdk.model.DataModel;
import com.rkhd.platform.sdk.param.ScriptTriggerParam;
import com.rkhd.platform.sdk.param.ScriptTriggerResult;
import com.rkhd.platform.sdk.test.tool.TestTriggerTool;
import net.sf.json.JSONArray;
import net.sf.json.JSONObject;
import org.apache.commons.lang.StringUtils;
import other.aakepi.bdfjfaackcpic.http.MincsoftHttpClient;
import other.aakepi.bdfjfaackcpic.trigger.BaseTrigger;

import java.util.List;

/**
 * 合同生效后自动生成上画记录
 */
public class MediaTrigger extends BaseTrigger implements ScriptTrigger {
    String map_key = "242940e21d575db5ec2f2c0ff4daa6b0";//正式
//    String map_key = "e6dead6d2e043ada9f9e8da4ff524165";//测试

    public ScriptTriggerResult execute(ScriptTriggerParam scriptTriggerParam)
            throws ScriptBusinessException {
        List<DataModel> list = scriptTriggerParam.getDataModelList();

        if (list != null && list.size() > 0) {
            DataModel dataModel = list.get(0);
            Integer id = Integer.parseInt(dataModel.getAttribute("id") + "");
            String address = dataModel.getAttribute("address") + "";
            if (StringUtils.isNotBlank(address)){
                //调用高德API获取经纬度
                MincsoftHttpClient mincsoftHttpClient = new MincsoftHttpClient();
                String resultJson = mincsoftHttpClient.sendSimpleGet("http://restapi.amap.com/v3/geocode/geo","address="+address+"&output=JSON&key="+map_key);
//                String resultJson = "{\"status\":\"1\",\"info\":\"OK\",\"infocode\":\"10000\",\"count\":\"1\",\"geocodes\":[{\"formatted_address\":\"北京市朝阳区五建小区\",\"province\":\"北京市\",\"citycode\":\"010\",\"city\":\"北京市\",\"district\":\"朝阳区\",\"township\":[],\"neighborhood\":{\"name\":[],\"type\":[]},\"building\":{\"name\":[],\"type\":[]},\"adcode\":\"110105\",\"street\":[],\"number\":[],\"location\":\"116.375282,39.997779\",\"level\":\"兴趣点\"}]}";
                if (StringUtils.isNotBlank(resultJson)) {
                    JSONObject object = JSONObject.fromObject(resultJson);
                    if (object.getInt("status")==1){
                        JSONArray geocodes = object.getJSONArray("geocodes");
                        String location = geocodes!=null&&geocodes.size()>0?geocodes.getJSONObject(0).getString("location"):"0,0";
                        if (StringUtils.isNotBlank(location)){
                            String[] lnglat = location.split(",");
                            JSONObject jsonObject = new JSONObject();
                            jsonObject.accumulate("id",id);
                            jsonObject.accumulate("lng",lnglat[0]);
                            jsonObject.accumulate("lat",lnglat[1]);
                            //2 更新坐标
                            updateBelongs(jsonObject);
                        }
                    }
                }

            }
        }

        ScriptTriggerResult scriptTriggerResult = new ScriptTriggerResult();
        scriptTriggerResult.setDataModelList(scriptTriggerParam.getDataModelList());
        return scriptTriggerResult;
    }



    public static void main(String[] args) {
        TestTriggerTool testTriggerTool = new TestTriggerTool();
        MediaTrigger paymentTrigger = new MediaTrigger();
        testTriggerTool.test("/Users/yujinliang/Documents/workspace/media/src/main/java/scriptTrigger.xml", paymentTrigger);
    }


}
