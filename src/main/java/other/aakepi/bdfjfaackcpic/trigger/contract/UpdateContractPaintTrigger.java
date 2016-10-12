package other.aakepi.bdfjfaackcpic.trigger.contract;

import com.rkhd.platform.sdk.ScriptTrigger;
import com.rkhd.platform.sdk.exception.ScriptBusinessException;
import com.rkhd.platform.sdk.model.DataModel;
import com.rkhd.platform.sdk.param.ScriptTriggerParam;
import com.rkhd.platform.sdk.param.ScriptTriggerResult;
import net.sf.json.JSONArray;
import net.sf.json.JSONObject;
import org.apache.commons.lang.StringUtils;
import other.aakepi.bdfjfaackcpic.trigger.BaseTrigger;
import other.aakepi.bdfjfaackcpic.util.DateUtil;

import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.HashMap;
import java.util.List;

/**
 * 媒体上画记录，媒体必须是销售的合同中，
 * Created by yangyixin on 16/10/12.
 */
public class UpdateContractPaintTrigger extends BaseTrigger implements ScriptTrigger {
    @Override
    public ScriptTriggerResult execute(ScriptTriggerParam scriptTriggerParam)
            throws ScriptBusinessException {
        List<DataModel> list = scriptTriggerParam.getDataModelList();
        Object idObj = list.get(0).getAttribute("id");
        Object contractIdObj = list.get(0).getAttribute("contractId");
        Object mediaIdObj = list.get(0).getAttribute("mediaId");


        String contractId = contractIdObj+"";
        String mediaIdId = mediaIdObj+"";
        if (StringUtils.isBlank(contractId)) {
            throw new ScriptBusinessException("合同必须选择");
        }
        if (StringUtils.isBlank(mediaIdId)) {
            throw new ScriptBusinessException("媒体必须选择");
        }


        JSONArray recordArray = getAllRecord(scriptTriggerParam.getUserId(), -1L, contractId, 0, 10);
        if(recordArray==null || recordArray.size()==0){
            throw new ScriptBusinessException("没有媒体纪录，不能添加上画纪录");
        }
        HashMap<String,String> mediaMap = new HashMap<String, String>();
        for (int i = 0; i < recordArray.size(); i++) {
            JSONObject record =recordArray.getJSONObject(i);
            String mediaId= record.getString("meidaId");
            mediaMap.put(mediaId,mediaId);
        }
        if (!mediaMap.containsKey(mediaIdId)){
            throw new ScriptBusinessException("该媒体不在，合同纪录中，请重新选择。");
        }

        ScriptTriggerResult scriptTriggerResult = new ScriptTriggerResult();
        scriptTriggerResult.setDataModelList(scriptTriggerParam.getDataModelList());
        return scriptTriggerResult;
    }

    /**
     * 获得时间范围内的纪录，只要查找就应该报错
     * @return
     */
    private JSONArray getAllRecord(Long userId, Long tenantId, String contractId, int first, int size) {

        String sql = "select id,meidaId from saleContractSpot where id > 0 ";
        StringBuilder sb = new StringBuilder();
        SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");
        //合同的全部点位
        if (StringUtils.isNotBlank(contractId)){
            sb.append(" and contractId = ").append(contractId);
        }

        sql = sql + sb.toString();

        return queryResultArray(sql.toString());

    }

}
