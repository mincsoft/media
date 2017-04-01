package other.aakepi.bdfjfaackcpic.config;

/**
 * Created by yangyixin on 16/10/5.
 */
public class SpotField {
    private String en;
    private String zn;
    private int width;
    private String other;
    //字段类型
    private String type;
    //是否媒体的字段
    private boolean isMediaField;

    public SpotField(){}


    public String getEn() {
        return en;
    }

    public void setEn(String en) {
        this.en = en;
    }

    public String getZn() {
        return zn;
    }

    public void setZn(String zn) {
        this.zn = zn;
    }

    public int getWidth() {
        return width;
    }

    public void setWidth(int width) {
        this.width = width;
    }

    public String getOther() {
        return other;
    }

    public void setOther(String other) {
        this.other = other;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public boolean isMediaField() {
        return isMediaField;
    }

    public void setIsMediaField(boolean isMediaField) {
        this.isMediaField = isMediaField;
    }

    @Override
    public String toString() {
        return "SpotField{" +
                "en='" + en + '\'' +
                ", zn='" + zn + '\'' +
                ", width=" + width +
                ", other='" + other + '\'' +
                ", type='" + type + '\'' +
                ", isMediaField=" + isMediaField +
                '}';
    }
}
