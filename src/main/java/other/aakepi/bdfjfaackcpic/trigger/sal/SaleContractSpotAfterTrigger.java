package other.aakepi.bdfjfaackcpic.trigger.sal;

import com.rkhd.platform.sdk.ScriptTrigger;
import com.rkhd.platform.sdk.exception.ScriptBusinessException;
import com.rkhd.platform.sdk.model.DataModel;
import com.rkhd.platform.sdk.param.ScriptTriggerParam;
import com.rkhd.platform.sdk.param.ScriptTriggerResult;
import com.rkhd.platform.sdk.test.tool.TestTriggerTool;
import other.aakepi.bdfjfaackcpic.trigger.BaseTrigger;

import java.util.List;

/**
 * Created by Administrator on 2017/3/7.
 */
public class SaleContractSpotAfterTrigger extends BaseTrigger implements ScriptTrigger {
    @Override
    public ScriptTriggerResult execute(ScriptTriggerParam scriptTriggerParam) throws ScriptBusinessException {
        List<DataModel> list = scriptTriggerParam.getDataModelList();

        if (list != null && list.size() > 0) {
            for (DataModel dataModel:list){

            }

        }
        return null;
    }
    public static void main(String[] args) {
        TestTriggerTool testTriggerTool = new TestTriggerTool();
        SaleContractSpotAfterTrigger saleContractSpotAfterTrigger = new SaleContractSpotAfterTrigger();
        testTriggerTool.test("E:\\ideaworkspace\\media\\src\\main\\java\\scriptTrigger.xml", saleContractSpotAfterTrigger);
    }


}
