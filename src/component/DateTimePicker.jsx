import { Param, UIInput,DateTimePickerConvertor,UITools,UIMessageHelper, I18nUtil, OnBlurEvent, OnChangeEvent, Convertor, ConvertorConstant } from "rainbowui-core";
import config from "config";
import PropTypes from 'prop-types';
import { StringUtil, Util } from 'rainbow-foundation-tools';
import { SessionContext} from 'rainbow-foundation-cache';

import "../css/jedate.css";


export default class DateTimePicker extends UIInput {


    renderInput() {
        const _tempClasss = Util.parseBool(this.props.enabled)?"input-group jedate":"input-group jedate jedate-disabled"
        return (
            <div className={_tempClasss}>
                    <div className="jeinpbox"> <input type="text" className="form-control jeinput "  title={this.getI18n(this.props.title)} style={this.props.style} id={this.componentId} name={this.getName()} placeholder={this.props.placeholder ? this.props.placeholder : ""} data-auto-test={this.getNameForTest()} /></div>
                    <span className="input-group-addon pickerposition">
                    <span className="glyphicon glyphicon-calendar"
                        onClick={this.onClickIcon.bind(this)} />
                    </span>
            </div>
        );
    }

   onClickIcon(event) {
        event.preventDefault();
        if(Util.parseBool(this.props.enabled)){
                const inputObj = $("#" + this.componentId);
                inputObj.focus();
                inputObj.click();
        }
    }
   

    deleteInputValue(event) {
        event.preventDefault();
        const { model, property } = this.props;
        if (model && property) {
            model[property] = null;
        }
        $("#" + this.componentId).val(null);
    }

    setInputValue(event,_self,dateComponent){
        _self.setComponentValue(event);
        let value = _self.getInputValue(event);
        if (_self.getDigitValue) {
            value = _self.getDigitValue(value);
        }
        if (_self.props.onChange) {
            let valueChangeEvent = new OnChangeEvent(_self, event, Param.getParameter(_self), value, _self.onEvent.newValue);
            _self.props.onChange(valueChangeEvent);
        }
     
        if (Util.parseBool(_self.props.required)) {
            if (value) {
                dateComponent.parent().parent().removeClass("input-required");
            } else {
                dateComponent.parent().parent().addClass("input-required");
            }
        }
    }

    initComponent(){
        const dateComponent = $("#" + this.componentId);
        let _self = this;

        dateComponent.jeDate({
            language:this.getLanguage(),
            format: this.getFormat(),
            minDate:this.getMinDate(),             
            maxDate:this.getMaxDate(),
            minutes:this.props.minutes?this.props.minutes:['00','10','20','30','40','50'],
            seconds:this.props.seconds?this.props.seconds:['00','10','20','30','40','50'],
            isShow:true,
            trigger:this.props.trigger,
            onClose:Util.parseBool(this.props.showTime)?true:false,
            isinitVal:this.props.defaultValue?true:false,                            
            initDate:this.getDefaultDate(),
            isTime:Util.parseBool(this.props.showTime),                               
            isClear:Util.parseBool(this.props.showClear),                               
            isToday:true,
            festival:true,
            fixed:true,
            marks:this.props.marks?this.props.marks:this.getMarks(),
            works:this.props.works?this.props.works:this.getWorks(),
            okfun:function (event) {
               if(event.date.hh=="24"&&Util.parseBool(_self.props.showTime)){
                event.date.mm="00"
                event.date.ss="00"
                const split = _self.getFormatSplit(_self);
                const value = `${event.date.YYYY}${split}${event.date.MM}${split}${event.date.DD} ${event.date.hh}:${event.date.mm}:${event.date.ss}`
                event.val = value
                $(event.elem[0]).val(value)
               }
               _self.setInputValue(event,_self,dateComponent);

               _self.props.onOk?_self.props.onOk(event):null;
            },
            success:function (elem) {
                _self.props.onShow?_self.props.onShow(elem):null;
                const findClass = _self.props.findClass?"."+_self.props.findClass:".input-group";
                dateComponent.closest(findClass).addClass("focusborder");
            },
            clearfun:function(elem, val) {
                const { model, property } = _self.props;
                if (model && property) {
                    model[property] = null;
                }
                _self.props.onClean?_self.props.onClean(elem, val):null;
            }, 
        });
        dateComponent.unbind("blur");

        dateComponent.blur(function(event){
            let value = $(this).val();
            const split = _self.getFormatSplit(_self);
            const findClass = _self.props.findClass?"."+_self.props.findClass:".input-group";
            $(this).closest(findClass).removeClass("focusborder");
            if(_self.checkValue(value,split)){
                value = value.replace(/[^0-9]/ig,"");
                const yyyy = value.slice(0,4);
                const mm = value.slice(4,6);
                const dd = value.slice(6,8);
                if(Util.parseBool(_self.props.showTime)){
                    value = value.padEnd(14, '0');
                    const hh = value.slice(8,10);
                    const ii = value.slice(10,12);
                    const ss = value.slice(12,14);
                    const returnDate = `${yyyy}${split}${mm}${split}${dd} ${hh}:${ii}:${ss}`;
                    if(_self.checkDate(`${yyyy}${split}${mm}${split}${dd}`)&&_self.checkTime(`${hh}:${ii}:${ss}`)){
                        $(this).val(returnDate);
                        _self.setInputValue(event,_self,dateComponent);
                    }else{
                        _self.deleteInputValue(event) 
                    }
                }else{
                    const returnDate = `${yyyy}${split}${mm}${split}${dd}`;
                    if(_self.checkDate(returnDate)){
                        $(this).val(returnDate);
                        _self.setInputValue(event,_self,dateComponent);
                    }else{
                        _self.deleteInputValue(event) 
                    }
                }
            }else{
                _self.deleteInputValue(event) 
            }
        });
    }

    checkDate (date) {
        var dateArr = date.match(/\w+|d+/g);
        if (isNaN(dateArr[0]) || isNaN(dateArr[1]) || isNaN(dateArr[2])) return false;
        if (dateArr[1] > 12 || dateArr[1] < 1) return false;
        if (dateArr[2] < 1 || dateArr[2] > 31) return false;
        if ((dateArr[1] == 4 || dateArr[1] == 6 || dateArr[1] == 9 || dateArr[1] == 11) && dateArr[2] > 30) return false;
        if (dateArr[1] == 2) {
            if (dateArr[2] > 29) return false;
            if ((dateArr[0] % 100 == 0 && dateArr[0] % 400 != 0 || dateArr[0] % 4 != 0) && dateArr[2] > 28) return false;
        }
        return true;
    }

    checkTime (time) {
        var dateArr = time.match(/\w+|d+/g);
        if (isNaN(dateArr[0]) || isNaN(dateArr[1]) || isNaN(dateArr[2])) return false;
        if (dateArr[0] > 24 || dateArr[0] < 0) return false;
        if (dateArr[1] < 0 || dateArr[1] > 59) return false;
        if (dateArr[2] < 0 || dateArr[2] > 59) return false;
        return true;
    }

    getFormatSplit(_self){
        return _self.getFormat().slice(4,5);
    }

    checkValue(val,split){
        if(val === "" || val ==null){
            return false;
        }
        val = val.replace(/[^0-9]/ig,"");
        if(!isNaN(val)&&val.length>=6){
            return true;
        }else{
            return false;
        }
    }

    getWorks(){
        const _config = SessionContext.get("project_config");
        return _config?_config.DEFAULT_DATETIME_WORK?_config.DEFAULT_DATETIME_WORK.split(","):null:null;
    }

    getMarks(){
        const _config = SessionContext.get("project_config");
        return _config?_config.DEFAULT_DATETIME_MARKER?_config.DEFAULT_DATETIME_MARKER.split(","):null:null;
    }

    getLanguage(){
        const cnLanguage = {                            
            name  : "cn",
            month : ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"],
            weeks : [ "日", "一", "二", "三", "四", "五", "六" ],
            times : ["小时","分钟","秒数"],
            clear : "清空",
            today : "今天",
            yes   : "确定",
            close : "关闭"
        }
     
        const enLanguage = {                            
            name  : "en",
            month : ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"],
            weeks : [ "SUN","MON","TUR","WED","THU","FRI","SAT" ],
            times : ["Hour","Minute","Second"],
            clear : "Clear",
            today : "Today",
            yes   : "set",
            close : "Close"
        }

        const AllLanguage = {"en_US":enLanguage,"zh_CN":cnLanguage}

        return AllLanguage[I18nUtil.getSystemI18N()];
    }
    componentDidMount(){
        super.componentDidMount();
        this.initComponent();
    }

    componentDidUpdate(nextProps, nextState) {
        super.componentDidUpdate(nextProps, nextState);
        this.clearValidationInfo(nextProps);   
        this.initComponent();
    }

    clearValidationInfo(nextProps) {
        const inputObject = $("#" + this.componentId);
        if (Util.parseBool(nextProps.required) && inputObject.val()) {
            inputObject.parent().parent().next().remove();
            const errorInputObject = inputObject.closest(".form-group");
            if (errorInputObject.hasClass("has-error")) {
                inputObject.closest(".input-group").css("border", "2px solid #E1E8EE");
            };
        }
    }
    

    getInputValue(event) {
        //let inputRef = this.getInputRefProperty();
        if (Util.parseBool(this.props.inline)) {
            return DateTimePickerConvertor.getAsString(this, event.date);
        }
        //return React.findDOMNode(this.refs[inputRef]).value;
        return $('#' + this.componentId).val();
    }

   

    getFormat() {
        return this.props.format?this.props.format:config.DEFAULT_DATETIME_FORMATER
    }

    getMinDate() {
        if (this.props.minDate) {
            let value = null;
            if (this.props.minDate == "TODAY") {
                let minToday = moment(moment().format("YYYYMMDD") + " 00:00:00", "YYYYMMDD HH:mm:ss");
                value = DateTimePickerConvertor.getAsObject(this, minToday.format(config.DEFAULT_DATETIME_SUBMIT_FORMATER));
            } else {
                value = DateTimePickerConvertor.getAsObject(this, this.props.minDate);
            }

            if (value != undefined) {
                let format = this.getFormat();
                if (format == "YYYY") {
                    return moment(value + "0101 00:00:00", "YYYYMMDD HH:mm:ss");
                }
                return value;
            }
        }
        return null;
    }

    getMaxDate() {
        if (this.props.maxDate != undefined) {
            let value = null;
            if (this.props.maxDate == "TODAY") {
                let maxToday = moment(moment().format("YYYYMMDD") + " 23:59:59", "YYYYMMDD HH:mm:ss");
                value = DateTimePickerConvertor.getAsObject(this, maxToday.format(config.DEFAULT_DATETIME_SUBMIT_FORMATER));
            } else {
                value = DateTimePickerConvertor.getAsObject(this, this.props.maxDate);
            }

            if (value != undefined) {
                let format = this.getFormat();
                if (format == "YYYY") {
                    return moment(value + "1231 23:59:59", "YYYYMMDD HH:mm:ss");
                }
                return value;
            }
        }
        return "2099-12-31 24:59:59";
    }

    getDefaultDate() {
        let defaultDate = DateTimePickerConvertor.getAsObject(this, this.props.defaultValue);
        if (defaultDate) {
            let maxDate = this.getMaxDate();
            let minDate = this.getMinDate();
            const momentDefaultDate = moment(defaultDate);
            if ((maxDate && momentDefaultDate.isAfter(maxDate)) || (minDate && momentDefaultDate.isBefore(minDate))) {
                defaultDate = "";
                const { model, property } = this.props;
                if (model && property) {
                    model[property] = null;
                }
            }else{
                return [{YYYY:momentDefaultDate.get('year'),MM:momentDefaultDate.get('month')+1,DD:momentDefaultDate.get('date'),hh:momentDefaultDate.get('hour'),mm:momentDefaultDate.get('minute'),ss:momentDefaultDate.get('second')},false]
            }
        }else{
                return []
        }
    }

    getDate() {
        let date = DateTimePickerConvertor.getAsObject(this, this.getComponentValue());
        if (date) {
            let maxDate = this.getMaxDate();
            let minDate = this.getMinDate();
            if ((maxDate && moment(date).isAfter(maxDate)) || (minDate && moment(date).isBefore(minDate))) {
                date = "";
                const { model, property } = this.props;
                if (model && property) {
                    model[property] = null;
                }
                $("#" + this.componentId).val(date);
            }

        }
        return date;
    }

    getConvertorId() {
        return ConvertorConstant.DATETIMEPICKER_CONVERTOR;
    }

    

};


/**@ignore
 * DateTimePicker component prop types
 */
DateTimePicker.propTypes = $.extend({}, UIInput.propTypes, {
    minDate: PropTypes.string,
    maxDate: PropTypes.string,
    format: PropTypes.string,
    trigger: PropTypes.string,
    defaultValue: PropTypes.string,
    showToday: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
    showClear: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
    showTime: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
    componentType: PropTypes.string,
    onOk: PropTypes.function,
    onClean: PropTypes.function,
    onShow: PropTypes.function,
    autoClose: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),

});

/**@ignore
 * Get DateTimePicker component default props
 */
DateTimePicker.defaultProps = $.extend({}, UIInput.defaultProps, {
    autoClose: true,
    showTime: false,
    showToday: true,
    showClear: true,
    trigger:"click",
    format: config.DEFAULT_DATETIME_FORMATER,
    componentType: "datetimepicker",
});
