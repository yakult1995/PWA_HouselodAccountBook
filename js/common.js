const vm = new Vue({
  el: '#book',
  data: {
      UserID: '',
      old_version: '',
      items: [],
      ItemNameList: [],
      suggestNameList: [],
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
      this.loadUserID();
      this.isSentUserID();

      this.nowMonth = 'Dec';
      this.items = [];
      this.loadItemList('items');
      this.loadItemList('lents');
      this.calTotal();
      this.newDate = this.myDate && this.myDate.toISOString().split('T')[0];
      this.lentDate = this.myDate && this.myDate.toISOString().split('T')[0];

      this.loadItemNameList();
      this.uploadAllItem();
  },
    computed:{
        filteredItemNames: function(){
          var ItemName = [];

          if(this.newName !== ''){
              for(var i in this.ItemNameList) {
                  if(this.ItemNameList[i].indexOf(this.newName) !== -1 && this.ItemNameList[i] !== this.newName){
                      ItemName.push(this.ItemNameList[i]);
                  }
              }
              return ItemName;
          }else{
              return false;
          }
      }
    },
    methods: {
      loadItemNameList: function(){
          var ItemList = JSON.parse(localStorage.getItem("items"));

          for(var item in ItemList){
              this.ItemNameList.push(ItemList[item]['name']);
          }

          // 重複削除
          this.ItemNameList = this.ItemNameList.filter(function (x, i, self) {
              return self.indexOf(x) === i;
          });
      },
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
            alert('updated');
            localStorage.setItem('version', JSON.stringify({'version' : $('#current_version').text()}));
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
        var BuyDate = new Date(newDate).toUTCString();
        this.newDay = BuyDate.toString().split(',')[0];

        // AWSに転送
        const url = `https://lpj8l40ho9.execute-api.us-east-1.amazonaws.com/v1`;
        axios.post(url,{
            "UserID"        : localStorage.getItem("UserID"),
            "hashedUserID"  : localStorage.getItem("hashedUserID"),
            "ItemName"      : newName,
            "ItemPrice"     : newBalance,
            "PayMethod"     : newHow,
            "BuyDate"       : newDate
        }).then(function (response) {
            console.log(response);
            console.log(vm.items);
            if(!vm.items)vm.items = [];
            vm.items.push({
                name: newName,
                balance: newBalance,
                date: newDate,
                day: vm.newDay,
                how: newHow,
                isUploaded: 'true',
                createdAt : new Date()
            });

            vm.addItemToList(vm.items, 'items');

            vm.newName = '';
            vm.newBalance = '';
            vm.newDate = vm.myDate && vm.myDate.toISOString().split('T')[0];
            vm.newDay = '';
            vm.newHow = 'card';
        })
        .catch(function (error) {
            console.log(error);
        });


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
              if(a.date < b.date) return 1;
              if(a.date > b.date) return -1;
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
            localStorage.setItem('hashedUserID', hashedUserID.toString());
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

          if(!isSentUserIDFlag){
              const url = `https://1q5kbt2d22.execute-api.us-east-1.amazonaws.com/v1`;
              axios.post(url,{
                  "UserID": localStorage.getItem("UserID"),
                  "hashedUserID": localStorage.getItem("hashedUserID")
              }).then(function (response) {
                  console.log(response);
                  localStorage.setItem("isSentUserID", "true");
                  return true;
              })
              .catch(function (error) {
                  console.log(error);
                  return false;
              });
          }else{
              return true;
          }
      },
      inputItemName: function(ItemName){
          console.log(ItemName);
          this.newName = ItemName;
      },
      uploadAllItem: function () {
          var AllItemList = JSON.parse(localStorage.getItem('items'));
          for(let i in AllItemList){
              // アップロードが終わってなかったら
              if(AllItemList[i]['isUploaded'] !== 'true'){
                  console.log(AllItemList[i]['name'] + "is not uploaded yet.");
                  // AWSに転送
                  const url = `https://lpj8l40ho9.execute-api.us-east-1.amazonaws.com/v1`;
                  axios.post(url,{
                      "UserID"        : localStorage.getItem("UserID"),
                      "hashedUserID"  : localStorage.getItem("hashedUserID"),
                      "ItemName"      : AllItemList[i]['name'],
                      "ItemPrice"     : AllItemList[i]['balance'],
                      "PayMethod"     : AllItemList[i]['how'],
                      "BuyDate"       : AllItemList[i]['date']
                  }).then(function (response) {
                      console.log(response);
                      // アップロードが成功するればフラグ変更
                      AllItemList[i]['isUploaded'] = 'true';
                  })
                  .catch(function (error) {
                      console.log(error);
                  });
              }else{
                  console.log(AllItemList[i]['name'] + "is uploaded.");
              }
          }

          // 最後にLocalStorageの更新
          this.saveItemList('items', AllItemList);
      },
      loadUserID: function(){
          if(!localStorage.getItem('UserID')){
              console.log("UserID is empty");
              this.selectTab(4);
          }else{
              this.UserID = localStorage.getItem('UserID');
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
});
