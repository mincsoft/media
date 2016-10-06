package other.aakepi.bdfjfaackcpic.enums;

import org.apache.commons.lang.StringUtils;

/**
 * Created by yujinliang on 16/9/22.
 */
public enum ResultType {
    SYSTEM_BUSY(Integer.valueOf(-1), "系统繁忙"),
    SUCCESS(Integer.valueOf(0), "请求成功"),
    OTHER_ERROR(Integer.valueOf(99999), "其他错误");

    Integer code;
    String description;

    private ResultType(Integer code, String description) {
        this.code = code;
        this.description = description;
    }

    public static ResultType get(String code) {
//        BeanUtil.requireNonNull(code, "code is null");
        if (StringUtils.isEmpty(code)){
            System.out.println("code is null");
            return  null;
        }
        ResultType[] list = values();
        ResultType[] arr$ = list;
        int len$ = list.length;

        for(int i$ = 0; i$ < len$; ++i$) {
            ResultType resultType = arr$[i$];
            if(code.equals(resultType.getCode().toString())) {
                return resultType;
            }
        }

        return null;
    }

    public Integer getCode() {
        return this.code;
    }

    public String getDescription() {
        return this.description;
    }

    public String toString() {
        return "ResultType{code=" + this.code + ", description=\'" + this.description + '\'' + '}';
    }
}
