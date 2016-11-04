package other.aakepi.bdfjfaackcpic.trigger.contract;

import com.rkhd.platform.sdk.ScriptTrigger;
import com.rkhd.platform.sdk.exception.ScriptBusinessException;
import com.rkhd.platform.sdk.model.DataModel;
import com.rkhd.platform.sdk.param.ScriptTriggerParam;
import com.rkhd.platform.sdk.param.ScriptTriggerResult;
import net.sf.json.JSONArray;
import net.sf.json.JSONObject;
import other.aakepi.bdfjfaackcpic.trigger.BaseTrigger;
import other.aakepi.bdfjfaackcpic.util.DateUtil;

import java.util.Date;
import java.util.List;

/**
 * 销售合同，保存trigger校验
 * Created by yangyixin on 16/10/12.
 */
public class UpdateSaleContractTrigger extends BaseTrigger implements ScriptTrigger {
    @Override
    public ScriptTriggerResult execute(ScriptTriggerParam scriptTriggerParam)
            throws ScriptBusinessException {
        List<DataModel> list = scriptTriggerParam.getDataModelList();
        Object idObj = list.get(0).getAttribute("id");
        Object startDateObj = list.get(0).getAttribute("startDate");
        Object endDateObj = list.get(0).getAttribute("endDate");
        String beginStr = startDateObj.toString();
        String endStr = endDateObj.toString();

        String contractId = idObj+"";
        Date begin =  new Date(Long.parseLong(beginStr)) ;
        Date end = new Date(Long.parseLong(endStr));
        logger.debug("UpdateSaleContractTrigger:contractId:" + contractId + ";begin=" + begin + ";end:" + end );


        if (!DateUtil.isBefore(begin,end)) {
            throw new ScriptBusinessException("begin time must before end time ");
        }

        ScriptTriggerResult scriptTriggerResult = new ScriptTriggerResult();
        scriptTriggerResult.setDataModelList(scriptTriggerParam.getDataModelList());
        return scriptTriggerResult;
    }

}
