package other.aakepi.bdfjfaackcpic.enums;

/**
 * 经营方式
 * Created by yangyixin on 16/10/12.
 */
public enum OpMode {
    OWN("1", "自由媒体"),
    BUY("2", "外购媒体");

    String code;
    String description;

    private OpMode(String code, String description) {
        this.code = code;
        this.description = description;
    }

    public static OpMode get(String code) {
        OpMode[] list = values();
        OpMode[] arr$ = list;
        int len$ = list.length;

        for(int i$ = 0; i$ < len$; ++i$) {
            OpMode resultType = arr$[i$];
            if(code.equals(resultType.getCode().toString())) {
                return resultType;
            }
        }

        return null;
    }

    public String getCode() {
        return this.code;
    }

    public String getDescription() {
        return this.description;
    }

    public String toString() {
        return "OpMode{code=" + this.code + ", description=\'" + this.description + '\'' + '}';
    }
}
