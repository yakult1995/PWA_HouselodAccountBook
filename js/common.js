const vm = new Vue({
  el: '#book',
  data: {
    old_version: '',
    items: [],
    newName: '',
    newBalance: '',
    newDay: '',
    newHow: 'card',
    totalBill: 0.0,
    newDate: '',
    myDate: new Date(),
    importedData: '',
    disp_day: '',
    day_bill: 0.0,
    itemFilter: false,
    isActiveTabNum: '1',
    nowMonth: 'Sep',
    monthlyBills: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jly', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  },
  mounted: function(){
    this.nowMonth = 'Aug';
    this.loadTodo();
    this.calTotal();
    this.newDate = this.myDate && this.myDate.toISOString().split('T')[0];

    // version check
    this.checkVersion();
  },
  methods: {
    setDispItem: function(item_name){
        if(!this.itemFilter){
            this.items = this.items.filter(function(item){
                return item.name == item_name;
            })
            // アイテムで絞ったときの合計金額計算
            for(var i = 0; i < this.items.length; i++){
                this.day_bill += parseFloat(this.items[i].balance);
            }
            this.itemFilter = true;
        }else{
            this.loadTodo();
            this.itemFilter = false;
        }
    },
    setMonth: function(month){
        this.nowMonth = month;
    },
    isActiveMonth: function(month){
        if(month == this.nowMonth){
            return true;
        }else{
            return false;
        }
    },
    isSelectTab: function(tab_num){
        this.isActiveTabNum = tab_num;
    },
    isActiveTab: function(tab_num){
        if(tab_num == this.isActiveTabNum){
            return true;
        }else{
            return false;
        }
    },
    setDsipDay:function(date){
        if(this.disp_day == ''){
            this.disp_day = date;
            this.day_bill = 0.0;
            
            var day_item = this.items.filter(function(item){
                return item['date'].split('T')[0].replace('-', '/').split('/')[1] == date;
            })
            console.log(day_item);
            for(var i = 0; i < day_item.length; i++){
                this.day_bill += parseFloat(day_item[i].balance);
            }
        }else{
            this.disp_day = '';
            this.day_bill = 0.0;
        }
    },
    isDispMonth: function(month){
        if(this.nowMonth == this.months[parseInt(month) - 1]){
            return true;
        }else{
            return false;
        }
    },
    isDispDay: function(date){
        if(this.disp_day == ''){
            return true;
        }else if(this.disp_day == date){
            return true;
        }else{
            return false;
        }
    },
    importData: function(importedData){
        this.importedData = importedData.split('\n');
        for(var i = 0; i < this.importedData.length; i++){
            var temp_data = this.importedData[i].split(',');
            this.addTodo(temp_data[0], temp_data[1], temp_data[2]);
        }
        this.importedData = '';
    },
    checkVersion: function(){
        this.old_version = JSON.parse(localStorage.getItem('version'));
        if(!this.old_version){
            this.old_version = {'version' : '0'};
        }
        if($('#current_version').text() != this.old_version['version']){
            alert('version up !');
            localStorage.setItem('version', JSON.stringify({
                'version' : $('#current_version').text()
            }));
        }
    },
    calTotal: function(){
        this.totalBill = 0.0;
        this.monthlyBills = this.monthlyBills.map(function(item){
            return 0;
        });
        for(var i = 0; i < this.items.length; i++){
            this.totalBill += parseFloat(this.items[i].balance);
            var month_num = parseInt(this.items[i].date.slice(5, 7));
            this.monthlyBills[month_num - 1] += parseFloat(this.items[i].balance);
        }
        this.totalBill = Math.round(this.totalBill * 100) / 100;
    },
    addTodo: function(newName, newBalance, newDate, newHow){
        this.newDay = this.myDate.toString().split(' ')[0];
        this.items.push({
            name: newName,
            balance: newBalance,
            date: newDate,
            day: this.newDay,
            how: newHow
        });
        this.newName = '';
        this.newBalance = '';
        this.newDate = this.myDate && this.myDate.toISOString().split('T')[0];
        this.newDay = '';
        this.newHow = 'card';
        this.saveTodo();
    },
    deleteTodo: function(ele){
        if(confirm(ele.name + 'を削除しますか？')){
            this.items = this.items.filter(function(item){
                return item.name != ele.name;
            })
            this.saveTodo();
        }
    },
    saveTodo: function(){
        // sort
        this.items.sort(function(a, b){
            if(a.date < b.date) return 1;
            if(a.date > b.date) return -1;
            return 0;
        });

        localStorage.setItem('items', JSON.stringify(this.items));

        this.calTotal();
    },
    loadTodo: function(){
        this.items = JSON.parse( localStorage.getItem('items') );
        if(!this.items){
            this.items = [];
        }
    }
  }
})

$(function() {
  var $win = $(window),
      $main = $('.tabContent'),
      $nav = $('#menu'),
      navHeight = $nav.outerHeight(true),
      navPos = $nav.offset().top,
      fixedClass = 'fixed';

  $win.on('load scroll', function() {
    var value = $(this).scrollTop();
    if ( value > navPos ) {
      $nav.addClass(fixedClass);
      $main.css('margin-top', navHeight);
    } else {
      $nav.removeClass(fixedClass);
      $main.css('margin-top', '0');
    }
  });
});