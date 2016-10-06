package other.aakepi.bdfjfaackcpic.api;

import com.alibaba.fastjson.JSON;
import other.aakepi.bdfjfaackcpic.enums.ResultType;
import org.apache.commons.lang.StringUtils;

/**
 * Created by yjl on 16/9/22.
 */
public class BaseResponse {
  private String errcode;
  private String errmsg;

  public String getErrcode() {
    return errcode;
  }

  public void setErrcode(String errcode) {
    this.errcode = errcode;
  }

  public String getErrmsg() {
    String result = this.errmsg;
    //将接口返回的错误信息转换成中文，方便提示用户出错原因
    if (StringUtils.isNotBlank(this.errcode) && !ResultType.SUCCESS.getCode().toString().equals(this.errcode)) {
      ResultType resultType = ResultType.get(this.errcode);
      if(resultType!=null) {
        result = resultType.getDescription();
      }
    }
    return result;
  }

  public void setErrmsg(String errmsg) {
    this.errmsg = errmsg;
  }


  public boolean isSuccess(){
    if (StringUtils.isBlank(this.errcode)||"0".equalsIgnoreCase(this.errcode))
      return true;
    return false;
  }

  public String toString(){
    return JSON.toJSONString(this);

  }

}
