package other.aakepi.bdfjfaackcpic.trigger;

import com.rkhd.platform.sdk.ScriptTrigger;
import com.rkhd.platform.sdk.exception.ScriptBusinessException;
import com.rkhd.platform.sdk.log.Logger;
import com.rkhd.platform.sdk.log.LoggerFactory;
import com.rkhd.platform.sdk.param.ScriptTriggerParam;
import com.rkhd.platform.sdk.param.ScriptTriggerResult;
//import com.rkhd.platform.sdk.test.tool.TestTriggerTool;

/**
 * 付款后更新付款计划
 */
public class BaseTrigger implements ScriptTrigger {
    private Logger logger = LoggerFactory.getLogger();


    @Override
    public ScriptTriggerResult execute(ScriptTriggerParam scriptTriggerParam) throws ScriptBusinessException {
        return null;
    }

}
