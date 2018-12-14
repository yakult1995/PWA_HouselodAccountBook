const vm = new Vue({
  el: '#book',
  data: {
      old_version: '',
      items: [],
      lents: [],
      newName: '',
      newBalance: '',
      newDay: '',
      newHow: 'card',
      totalBill: 0.0,
      newDate: '',
      myDate: new Date(),
      lentName: '',
      lentBalance: '',
      lentHow: '',
      lentDate: new Date(),
      importedData: '',
      disp_day: '',
      day_bill: 0.0,
      itemFilter: false,
      ActiveTabNum: 1,
      nowMonth: 'Dec',
      monthlyBills: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  },
  mounted: function(){
      // version check
      this.checkVersion();
      this.isSentUserID();

      this.nowMonth = 'Dec';
      this.items = [];
      this.loadItemList('items');
      this.loadItemList('lents');
      this.calTotal();
      this.newDate = this.myDate && this.myDate.toISOString().split('T')[0];
      this.lentDate = this.myDate && this.myDate.toISOString().split('T')[0];
  },
    methods: {
      setDispItem: function(item_name){
          this.day_bill = 0.0;

          if(!this.itemFilter){
              this.items = this.items.filter(function(item){
                  return item.name === item_name;
              });

              // アイテムで絞ったときの合計金額計算
              for(var i = 0; i < this.items.length; i++){
                  this.day_bill += parseFloat(this.items[i].balance);
              }
              this.itemFilter = true;
          }else{
              this.loadItemList('items');
              this.itemFilter = false;
          }
      },
      setMonth: function(month){
          this.nowMonth = month;
      },
      isActiveMonth: function(month){
          if(month === this.nowMonth){
              return true;
          }else{
              return false;
          }
      },
      selectTab: function(tab_num){
        this.ActiveTabNum = tab_num;
      },
      isActiveTab: function(tab_num){
        return tab_num === this.ActiveTabNum;
      },
      setDsipDay:function(date){
        if(this.disp_day === ''){
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
        return this.nowMonth === this.months[parseInt(month) - 1];
    },
    isDispDay: function(date){
        if(this.disp_day === ''){
            return true;
        }else if(this.disp_day === date){
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
        if($('#current_version').text() !== this.old_version['version']){
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
        if(!this.items)return 0;
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
            how: newHow,
            createdAt : new Date()
        });
        this.addItemToList(this.items, 'items');

        // AWSに転送
        const url = `https://lpj8l40ho9.execute-api.us-east-1.amazonaws.com/v1`;
        axios.post(url,{
            "UserID"        : localStorage.getItem("UserID"),
            "hashedUserID"  : localStorage.getItem("hashedUserID"),
            "ItemName"      : newName,
            "ItemPrice"     : newBalance
        }).then(function (response) {
            console.log(response);
        })
        .catch(function (error) {
            console.log(error);
        });

        this.newName = '';
        this.newBalance = '';
        this.newDate = this.myDate && this.myDate.toISOString().split('T')[0];
        this.newDay = '';
        this.newHow = 'card';
    },
      addLentMoney: function(lentName, lentBalance, lentHow, lentDate){
          this.lents.push({
              name: lentName,
              balance: lentBalance,
              date: lentDate,
              how: lentHow,
              createdAt : new Date()
          });
          this.addItemToList(this.lents, 'lents');

          this.lentName = '';
          this.lentBalance = '';
          this.lentHow = 'give';
          this.lentDate = this.myDate && this.myDate.toISOString().split('T')[0];
      },
      addItemToList: function(ItemList, ItemListName){
          localStorage.setItem(ItemListName, JSON.stringify(ItemList));
          this.saveItemList(ItemListName, ItemList);
      },
      deleteItemFromList: function(ele, ItemList, ItemListName){
          if(confirm(ele.name + 'を削除しますか？')) {
              ItemList = ItemList.filter(function (item) {
                  if(item.createdAt === ""){
                      return item.name !== ele.name;
                  }else {
                      return item.createdAt !== ele.createdAt;
                  }
              });
              this.saveItemList(ItemListName, ItemList);
          }
      },
      saveItemList: function(ItemListName, ItemList){
          // Sort
          this[ItemListName].sort(function(a, b){
              if(a.createdAt < b.createdAt) return 1;
              if(a.createdAt > b.createdAt) return -1;
              return 0;
          });

          localStorage.setItem(ItemListName, JSON.stringify(ItemList));
          this.loadItemList(ItemListName);
          this.calTotal();
      },
      loadItemList: function(ItemListName){
          this[ItemListName] = JSON.parse( localStorage.getItem(ItemListName) );
      },
      changeUserID: function(userID){
        console.log("Requested UserID : " + userID);
        if(userID){
            var shaObj = new jsSHA("SHA-256", "TEXT");
            shaObj.update(userID + String(new Date()));
            var hashedUserID = shaObj.getHash("HEX");
            localStorage.setItem('hashedUserID', hashedUserID);
            localStorage.setItem('UserID', userID);
            $('#itemResistButton').prop("disabled", false);

            this.selectTab(1);
            this.isSentUserID();
        }else{
            console.log("UserID Error");
        }
      },
      isSentUserID: function(){
          if(!localStorage.getItem("UserID"))return false;

          var isSentUserIDFlag = localStorage.getItem("isSentUserID");
          console.log(isSentUserIDFlag);

          if(!isSentUserIDFlag){
              const url = `https://1q5kbt2d22.execute-api.us-east-1.amazonaws.com/v1`;
              axios.post(url,{
                  "UserID": localStorage.getItem("UserID"),
                  "hashedUserID": localStorage.getItem("hashedUserID")
              }).then(function (response) {
                  console.log(response);
                  localStorage.setItem("isSentUserID", "true");
              })
              .catch(function (error) {
                  console.log(error);
              });
          }
      }
  }
});

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

    if(!isResisteredUser()){
        console.log("UserID is empty");
        $('#itemResistButton').prop("disabled", true);
        vm.selectTab(4);
    }
});

// User登録が済んでいるかの確認
function isResisteredUser(){
    userID = localStorage.getItem('UserID');
    console.log("UserID : " + userID);
    return userID;
}