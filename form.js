// Đối tượng 
const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);
function Validator(options) {
    function getParent(element, selector) {
          while (element.parentElement) {
              if(element.parentElement.matches(selector)) {// kiểm tra phần tử JS trùng với element 
                  return element.parentElement;
              }
              element = element.parentElement;
          }
    }
    var selectorRules = {};    

    function validate(inputElement , rule) {
        var errorElement = getParent(inputElement,options.formGroupSelector).querySelector(options.errorSelector);
        var errorMessage ;
    // lấy ra các rule của selector
        var rules = selectorRules[rule.selector];
        //lặp qua từng rule rồi kiểm tra
        for(var i = 0; i < rules.length; i++) {
            switch(inputElement.type) {
                case 'radio':
                case 'checkbox':
                    errorMessage = rules[i](
                        formElement.querySelector(rule.selector + ':checked')
                    );
                    break;
                    default:
                    errorMessage = rules[i](inputElement.value);
                    
            }
           //nếu có lỗi thì dừng kiểm tra
           if(errorMessage)
           break;
        }
           if(errorMessage) {
               errorElement.innerText = errorMessage;
               getParent(inputElement,options.formGroupSelector).classList.add('invalid')
            }else {
               errorElement.innerText = '';
               getParent(inputElement,options.formGroupSelector).classList.remove('invalid');
          }
          return !errorMessage;
    }
    // lấy element của form
   var formElement = $(options.form);
   if(formElement) {
       //khi submit
       formElement.onsubmit = function(event) {
           event.preventDefault();
           var isFormValid = true;
           // lặp qua từng rule và validate
           options.rules.forEach((rule) => {
              var inputElement = formElement.querySelector(rule.selector);
              var isValid =  validate(inputElement, rule);
              if(!isValid) {
                  isFormValid = false;
              }    
            });
           if(isFormValid) {
               // trường hợp submit với javascript
               if(typeof options.onSubmit === 'function') {
                var enableInput = formElement.querySelectorAll('[name]');
                var formValues = Array.from(enableInput).reduce((values, input) => {
                   
                    switch(input.type) {
                        case 'radio':
                            values[input.name] = formElement.querySelector('input[name ="' +input.name + '"]:checked').value;
                            break;    
                        case 'checkbox':
                            if(!input.matches(':checked')) {
                                values[input.name] = '';
                                return values;
                            }
                            if(!Array.isArray(values[input.name])) {
                                values[input.name] = [];
                            }
                            values[input.name].push(input.value);
                            break;
                        case 'file':
                            values[input.name] = input.files;
                            break;
                        default:
                            values[input.name] = input.value ;
                    }
                    return  values;// return có toán tử && thì sẽ return vế sau
                }, {});
                   options.onSubmit(formValues)
               }
               // trường hợp với hành vi mặc định
           }else {
            //    formElement.submit();
           }
       }
       // lặp qua mỗi rule và xử lí
         options.rules.forEach((rule) => {
            
            //Lưu lại các rules cho mỗi input
            if(Array.isArray(selectorRules[rule.selector])) {
               selectorRules[rule.selector].push(rule.test);
            }else {
                selectorRules[rule.selector] =[rule.test];
            }
             var inputElements = formElement.querySelectorAll(rule.selector);
             Array.from(inputElements).forEach((inputElement) => {
                  // xử lí th blur ra ngoài
                  inputElement.onblur = () => {
                    // lấy value : inputElement.value
                    // lấy function test : rule.test
                 validate(inputElement, rule);
                }
                //xử lí mỗi khi người dùng bắt đầu nhập
                inputElement.oninput = () => {
                   var errorElement = getParent(inputElement,options.formGroupSelector).querySelector('.form-message');
                   errorElement.innerHTML = '';
                   getParent(inputElement,options.formGroupSelector).classList.remove('invalid');
                }
             })
         });
   }
}
// Định nghĩa rules
// nguyên tắc của các rules :
//1 . Khi có lỗi trả ra message lỗi
// 2. Khi ko có lỗi => undefined
Validator.isRequired = (selector, message) => {
     return  {
         selector:selector,
         test:function(value) {
             return value ? undefined : 'Vui lòng nhập trường này'
         }
     };
}
Validator.isEmail = (selector, message) => {
    return  {
        selector:selector,
        test:function(value) {
           var regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
            return regex.test(value) ? undefined : 'Trường này là email';
        }
    };
}
Validator.minLenght = (selector, min) => {
    return  {
        selector:selector,
        test:function(value) {
           return value.length >= min ? undefined : `Vui lòng nhập tối thiểu ${min} kí tự`;
        }
    };
}
Validator.isConfirmed = (selector,getConfirmValue , message) => {
    return  {
        selector:selector,
        test:function(value) {
            return value === getConfirmValue() ? undefined : message || 'Thông tin không chính xác';
        }
    };
}