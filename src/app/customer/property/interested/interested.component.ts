import { Component, AfterViewInit, OnDestroy, OnInit, ViewChild, ViewEncapsulation, ElementRef, Renderer } from '@angular/core';
import { AuthService } from 'src/app/service/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { DataTableDirective } from 'angular-datatables';
import { Observable, Subject } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { SortableModalComponent } from 'src/app/shared/sortable-modal/sortable-modal.component';
import { ConlactLogComponent } from '../conlact-log/conlact-log.component'
import { FormGroup } from '@angular/forms';
import { ExcelService } from '../../../service/excel.service';
import { ToastrService } from 'ngx-toastr';
import { AppState } from './../../../app.state';
import { User } from './../../../models/user.model';
import { Store } from '@ngrx/store';
import { EmailStatusComponent } from 'src/app/shared/email-status/email-status.component';
import { SmsStatusComponent } from 'src/app/shared/sms-status/sms-status.component';
import { RecordNameComponent } from 'src/app/shared/record-name/record-name.component';
import { RecordNameChangeComponent } from 'src/app/shared/record-name-change/record-name-change.component';
require("inputmask/dist/inputmask/inputmask.numeric.extensions");
var Inputmask = require("inputmask/dist/inputmask/inputmask.date.extensions");
declare var $: any;

class Action {
  id: number;
  status: number;
}
class Filters {  
  Owner1FirstName: string;
  OwnerLastname1: string;  
  SitusCity: string;
  status: string;
  address: string;
  phone: string;
  email: string;
  SitusZipCode: string;
  SitusState: string;
}

class ManageGrid {
  gridSelect: number = 10;
  gridsStatus:any = [true, true, true, true, true, true, true, true, true, true];
  gridCol:any = [0,1,2,3,4,5,6,7,8,9];
  gridColName:any=['First Name', 'Last Name', 'City', 'Status', 'Email & Phone' , 'Action' , 'Zip Code', 'State', 'Address','Market Value' ];
  type: number = 1;
}
@Component({
  selector: 'app-interested',
  templateUrl: './interested.component.html',
  styleUrls: ['./interested.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class InterestedComponent implements AfterViewInit, OnDestroy, OnInit {

  @ViewChild(DataTableDirective, { static: false })
  dtElement: DataTableDirective;
  dtTrigger = new Subject();
  action = new Action();
  exlTableData: any = [];
  dtOptions = {}
  total: number = 0;
  user:Observable<User>;
  load:number=0
  prospectList: any = [];
  listenFunc: Function;
  manageGrid = new ManageGrid();
  filterObj = new Filters();
  filter:boolean = false;
  dataTables: any = [];
  searchArr: any =[];

  constructor(private authService: AuthService, private actRouter: ActivatedRoute, private router: Router, elementRef: ElementRef, private renderer: Renderer, private modal: NgbModal, private toastr: ToastrService, private excelService: ExcelService,
    private store: Store<AppState>) {
      
      this.user=store.select('user')

    this.listenFunc = renderer.listen(elementRef.nativeElement, 'click', (event) => {
      
      if (event.target.hasAttribute('view-prop')) {
        const url = '/customer/property/' + event.target.getAttribute('view-prop');
        window.open(url, '_blank');
        //this.router.navigate(['/customer/property/' + event.target.getAttribute('view-prop')])
      }
      if (event.target.hasAttribute('open-log')) {
        this.onOpenFlyout(event.target.getAttribute('open-log'))
      }

      
      if(event.target.hasAttribute('pur-id')){
        const purchase_id = event.target.getAttribute('pur-id')
        this.authService.emailMarketingData(purchase_id,'email', 'datatree').subscribe(data=>{
          const modalRef = this.modal.open(RecordNameComponent, { size: 'lg' });
          modalRef.componentInstance.data = data.data;
          modalRef.componentInstance.rows = purchase_id;
          modalRef.componentInstance.type = 'email';
          modalRef.result.then((result) => {
            if(result===1){
              const modalRef = this.modal.open(RecordNameChangeComponent, { size: 'lg' });
              modalRef.componentInstance.data = data.data;
              modalRef.componentInstance.rows = purchase_id;
              modalRef.componentInstance.type = 'email';
            }
            else if(result===2){
              const modalRef = this.modal.open(EmailStatusComponent, { size: 'lg' });
              modalRef.componentInstance.data = data.data;
              modalRef.componentInstance.rows = purchase_id;
            }
            
          })

        })
      }

      
      if(event.target.hasAttribute('purh-id')){
        const purchase_id = event.target.getAttribute('purh-id')
        this.authService.emailMarketingData(purchase_id,'phone', 'datatree').subscribe(data=>{
          const modalRef = this.modal.open(RecordNameComponent, { size: 'lg' });
          modalRef.componentInstance.data = data.data;
          modalRef.componentInstance.rows = purchase_id;
          modalRef.componentInstance.type = 'phone';
          modalRef.result.then((result) => {
            if(result===1){
              const modalRef = this.modal.open(RecordNameChangeComponent, { size: 'lg' });
              modalRef.componentInstance.data = data.data;
              modalRef.componentInstance.rows = purchase_id;
              modalRef.componentInstance.type = 'phone';
            }
            else if(result===2){
              const modalRef = this.modal.open(SmsStatusComponent, { size: 'lg' });
              modalRef.componentInstance.data = data.data;
              modalRef.componentInstance.rows = purchase_id;
            }
            
          })
        })
      }

      if (event.target.hasAttribute('warm-idx')) {
        this.bulb(event.target.getAttribute('warm-idx'));
      }
      if (event.target.hasAttribute('hot-idx')) {
          this.fire(event.target.getAttribute('hot-idx'));
      }
      if (event.target.className == 'btn btn-actions dels') {
        //punch3if (confirm("Are you sure to remove this property from Warm Prospects? If yes, you can recover this from Trash anytime :)")) {
          this.trash(event.target.getAttribute('set-idx'));
        //punch3}
      }
    })
  }


  public onOpenFlyout = (info) =>
    this.openFlyout(info);
  private openFlyout(info) {
    const modalRef = this.modal.open(ConlactLogComponent, { windowClass: 'flyout-right' });
    modalRef.componentInstance.info = info;
  }
  // gridSelect:number = 8;
  // gridsStatus:any=[false, false, false, false, false, false, false, false, false];
  // gridCol:any=[0,1,2,3,4,5,6,7,8];
  // gridColName:any=['First Name', 'Last Name', 'Address', 'City', 'State', 'Zip Code', 'Market Value', 'Status', 'Action'];

  ngOnInit() {

    this.user.subscribe(x=>{
      this.load=x.user
    })
    if(this.load==0){

      $('#cover-spin').hide(0);
      return
    }

    let init: boolean = false;
    // this.authService.getInterestedAll().subscribe((data)=>{ 
    //   this.exlTableData=data.data.data;
    // });
    this.authService.getGridList(1).subscribe((data) => {
      console.log(data)
      if (data.data.length > 0) {
        this.manageGrid.gridSelect = data.data[0].grid_total_number;
        this.manageGrid.gridsStatus = JSON.parse(data.data[0].column_status);
        this.manageGrid.gridCol = JSON.parse(data.data[0].selected_column);
        this.manageGrid.gridColName = JSON.parse(data.data[0].column_name);
        init = true;
      }
    });
    Inputmask().mask(document.querySelectorAll("input"));
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    });

    $('.filter_and_title .filter i').click(function () {
      $('.filter_box ').slideToggle(100);
    });
    this.dtOptions = {
      dom: 'lBfrtip',
      responsive: true,
      serverSide: true,
      processing: true,
      colReorder: true,
      aaSorting: [[ 4, 'desc' ]], 
      buttons: [],
      drawCallback: function () {
        var hasRows = this.api().rows({ filter: 'applied' }).data().length > 0;
        $('.dt-buttons')[0].style.display = hasRows ? '' : 'none'
      },
      pagingType: "full_numbers",
      searching: false,
      lengthMenu: [
        [10, 20, 25, 50, 100, 150, 200, 250, 300, -1],
        [10, 20, 25, 50, 100, 150, 200, 250, 300, 'All']
      ],
      ajax: (dataTablesParameters: any, callback) => {

        this.authService.getInterested({...dataTablesParameters, ...this.filterObj})
        .subscribe((data) => {
          this.prospectList = JSON.parse(data.data).data;
          console.log(this.prospectList)
          callback({
            recordsTotal: JSON.parse(data.data).recordsTotal,
            recordsFiltered: JSON.parse(data.data).recordsFiltered,
            data: this.prospectList
          });
        }, error => {
          console.log(error)
        })
      
      

      },
      initComplete: function (settings, json) {
        if (init) {
          init = false;
          $('#initGrid').click();
        }
      },
      columns: [
        //{ data: 'Owner1FirstName', title: 'First Name', defaultContent: '-' },
        { data: 'Owner1FirstName', title: 'First Name', defaultContent: 'NA' , render: function (data, type, row) {
          let strDate=row.logs ? row.logs.contact_date:'';
          let fName=data ? row.Owner1FirstName:'NA';
          if(strDate){
            let dataMon = strDate.split('-');
            dataMon[1] = dataMon[1].substr(0, 3)
            dataMon = dataMon.join('-');
            return  fName +'<small class="last_contact">Last Contact:' +' ' + dataMon + '</small>';
          }
          else{
            return  fName ;
          }
         // return  fName +'<small class="last_contact">Last Contact:' +' ' +strDate + '</small>'
        }
      },
        { data: 'OwnerLastname1', title: 'Last Name', defaultContent: 'NA',  render:function(data,type,row) {
          return row.OwnerLastname1.length> 10? `${row.OwnerLastname1.substr(0, 10)}...`: row.OwnerLastname1; 
          } },
        { data: 'SitusCity', title: 'City', defaultContent: 'NA' },
        {
          data: 'status',
          title: 'Status', orderable: false, className: 'text-center',
          render: function (data, type, row, index) {
            
            let bulb = data == 1 ? 'bulbs' : 'bulbs2';
            let fire = data == 2 ? 'fires' : 'fires2';

            let oppStatus="";
            let statusTitle="";
            if(row.opportunity_status==1){
              oppStatus='src="assets/images/pros.png"';
             statusTitle='Prospecting';
            }
            if(row.opportunity_status==2){
              oppStatus='src="assets/images/qulification.png"';
             statusTitle='Qualification';
            }
            if(row.opportunity_status==3){
              oppStatus='src="assets/images/analysis.png"';
             statusTitle='Needs Analysis';
            }
            if(row.opportunity_status==4){
              oppStatus='src="assets/images/value-proposition.png"';
             statusTitle='Value Proposition';
            }
            if(row.opportunity_status==5){
              oppStatus='src="assets/images/dec-make.png"';
             statusTitle='Decision Makers';
            }
            if(row.opportunity_status==6){
              oppStatus='src="assets/images/per-analysis.png"';
             statusTitle='Perception Analysis';
            }
            if(row.opportunity_status==7){
              oppStatus='src="assets/images/proposal.png"';
             statusTitle='Proposal/Price Quote';
            }
            if(row.opportunity_status==8){
              oppStatus='src="assets/images/negotion.png"';
             statusTitle='Negotiation/Review';
            }
            if(row.opportunity_status==9){
              oppStatus='src="assets/images/closed-won.png"';
             statusTitle='Closed Won';
            }
            if(row.opportunity_status==10){
              oppStatus='src="assets/images/lost.png"';
             statusTitle='Closed Lost';
            }
            if(row.opportunity_status==0){
              oppStatus='src="assets/images/nostatus.png"';
             statusTitle='No status';
            }
            return '<ul class="btnsLst"><li><button  class="btn btn-actions"><img ' + oppStatus + ' alt=""></button> </li><li> <button warm-idx="' + index.row + '" class="btn btn-actions ' + bulb + ' bulbs_' + index.row + '"></button> </li><li><button hot-idx="' + index.row + '" class="btn btn-actions ' + fire + ' hot_' + index.row + '"></button></li><li><button open-log="' + row.property_id + '" class="btn btn-actions sn"></button></li><li><button set-idx="' + index.row + '" class="btn btn-actions dels"></button></li></ul>'
          }
        },
        { title: 'Email & Phone', defaultContent: 'NA', orderable: false, data:'user_property.updated_at' , render: function (data, type, row) {
            let email = ``;
            let phone = ``;

            if(parseInt(row.batch_search_email_flag) === 1) {
              if(parseInt(row.email_search_flag) === 1) {
                email = `<a  pur-id="${row.property_id}" class="pending_btns" purchase-type="email"><button class="btn btn-success inherticlass fetch_records_cta"><i class="fa fa-envelope fa-lg"></i></button></a>`;
              } else {
                email = `<a href="javascript:void(0);"><button class="btn btn-secondary secondary_tooltip"><i class="fa fa-envelope fa-lg"></i></button></a>`;
              }
            } else {
              email = `<a  purchase-id="${row.property_id}" purchase-type="email" class="pending_btn"><button class="btn btn-info inherticlass pending_data_cta"><i class="fa fa-envelope fa-lg"></i></button></a>`;
            }

            if(parseInt(row.batch_search_phone_flag) === 1) {
              if(parseInt(row.phone_search_flag) === 1) {
                phone = `<a purh-id="${row.property_id}" class="pending_btns" purchase-type="phone"><button class="btn btn-success inherticlass fetch_records_cta"><i class="fa fa-mobile fa-lg"></i></button></a>`;
              } else {
                phone = `<a href="javascript:void(0);"><button class="btn btn-secondary secondary_tooltip"><i class="fa fa-mobile fa-lg"></i></button> </a>`;
              }
            } else {
              phone = `<a purchase-id="${row.property_id}" purchase-type="phone" class="pending_btn"><button class="btn btn-info inherticlass pending_data_cta"><i class="fa fa-mobile fa-lg"></i></button></a>`;
            }

            return `<div class="relative"> ${email} ${phone} </div>`;
          }
        },
        {
          data: 'PropertyId', title: 'Action', orderable: false, className: 'text-center', render: function (data, type, row) {
            return '<Button view-prop="' + data + '" class="btn btn-default go">Go</Button>'
          }
        },
        //punch4
        { data: 'SitusZipCode', title: 'Zip Code', defaultContent: 'NA' ,render: function(data, type, row){
          return data.length == 4 ? '0'+ data : data;
        }},
        // end-punch4
        { data: 'SitusState', title: 'State', defaultContent: 'NA' },
        {
          title: 'Address',data: 'address', defaultContent: 'NA',
          render: function (data, type, row) {
            let houseNumber = row.SitusHouseNumber == null ? '' : row.SitusHouseNumber;
            let streetName = row.SitusStreetName == null ? '' : row.SitusStreetName;
            let siteMode = row.SitusMode == null ? '' : row.SitusMode;
            let addresStr = houseNumber + ' ' + streetName + ' ' + siteMode;
            data = addresStr;
            return data.trim()===''? 'NA' : data 
          }
        },          
        {
          data: 'LMSSalePrice', title: 'Market Value', defaultContent: 'NA', className: 'text-right', render: function (data, type, row) {
            return formatter.format(data)
          }
        }
        
      ]
    };
  }
  ngAfterViewInit(): void {
    
    this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.columns().every(function () {
        const that = this;
        $('#search').on('click', function () {
          that.search(this['value']).draw();
        });
      });
    });
    this.dtTrigger.next();
  }
  ngOnDestroy(): void {
    this.dtTrigger.unsubscribe();
    this.listenFunc();
  }
  onGridSelectChange(event) {
    if (event) {
      for (var i = 8; i >= 0; i--) {
        if (i > parseInt(event)) {
          this.manageGrid.gridsStatus[i] = true;
        } else {
          this.manageGrid.gridsStatus[i] = false;
        }
      }
    }
  }

  bulb(index: number): void {
    
    if($(`.bulbs_${index}`).hasClass('bulbs2')) {
      this.action.status = 1;
      $(`.bulbs_${index}`).removeClass('bulbs2').addClass('bulbs');
      $(`.hot_${index}`).removeClass('fires').addClass('fires2');
    } else {
      this.action.status = 0
      $(`.bulbs_${index}`).removeClass('bulbs').addClass('bulbs2');
    }
    this.action.id = this.prospectList[index].property_id;
    this.authService.postAction(this.action)
    .subscribe((data) => { console.log(data) }, (error) => { console.log(error) });

    // let info = this.prospectList[index];
    // this.action.id = info.property_id

    // ++index
    // let $this;
    // if ($('#prospectTbl tr:nth-child(' + (index) + ')').hasClass('parent')) {
    //   $this = $('#prospectTbl tr:nth-child(' + (index) + ')').next('tr.child');
    // } else {
    //   $this = $('#prospectTbl tr:nth-child(' + (index) + ')');
    // }
    // if ($this.find('.btnsLst li:nth-child(1) button').hasClass('bulbs2')) {
    //   this.action.status = 0
    //   this.authService.postAction(this.action)
    //     .subscribe((data) => { console.log(data) }, (error) => { console.log(error) })
    //   $this.find('.btn.btn-actions.bulbs2').removeClass('bulbs2').addClass('bulbs')
    // } else {
    //   this.action.status = 1
    //   this.authService.postAction(this.action)
    //     .subscribe((data) => { console.log(data) }, (error) => { console.log(error) })
    //   $this.find('.btn.btn-actions.bulbs').removeClass('bulbs').addClass('bulbs2')
    // }
    // $this.find('.btn.btn-actions.fires2').removeClass('fires2').addClass('fires');
  }

  fire(index: number): void {
    if($(`.hot_${index}`).hasClass('fires2')) {
      this.action.status = 2;
      $(`.bulbs_${index}`).removeClass('bulbs').addClass('bulbs2');
      $(`.hot_${index}`).removeClass('fires2').addClass('fires');
    } else {
      this.action.status = 0;
      $(`.hot_${index}`).removeClass('fires').addClass('fires2');
    }

    this.action.id = this.prospectList[index].property_id;
    this.authService.postAction(this.action)
    .subscribe((data) => { console.log(data) }, (error) => { console.log(error) })
    
    // let info = this.prospectList[index];
    // this.action.id = info.property_id
    // ++index
    // let $this;

    // console.log($('#prospectTbl tr:nth-child(' + (index) + ')'));

    // if ($('#prospectTbl tr:nth-child(' + (index) + ')').hasClass('parent')) {
    //   $this = $('#prospectTbl tr:nth-child(' + (index) + ')').next('tr.child');
    // } else {
    //   $this = $('#prospectTbl tr:nth-child(' + (index) + ')');
    // }

    // if ($this.find('.btnsLst li:nth-child(2) button').hasClass('fires2')) {
    //   this.action.status = 0;
    //   console.log('fires', this.action);
    //   $this.find('.btn.btn-actions.fires2').removeClass('fires2').addClass('fires');

    //   // this.authService.postAction(this.action)
    //   //   .subscribe((data) => { 
    //   //     console.log(data);
    //   //     $this.find('.btn.btn-actions.fires2').removeClass('fires2').addClass('fires');
    //   //   }, (error) => { console.log(error) })
    // } else {
    //   this.action.status = 2;
    //   console.log('fires2', this.action);
    //   $this.find('.btn.btn-actions.fires').removeClass('fires').addClass('fires2');

    //   // this.authService.postAction(this.action)
    //   //   .subscribe((data) => { 
    //   //     $this.find('.btn.btn-actions.fires').removeClass('fires').addClass('fires2');
    //   //     console.log(data) 
    //   //   }, (error) => { console.log(error) })
    // }
    // $this.find('.btn.btn-actions.bulbs2').removeClass('bulbs2').addClass('bulbs');
  }

  trash(index: number): void {
    let info = this.prospectList[index];
    console.log(info)
    this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.row('tr:nth(' + index + ')').remove();
      dtInstance.draw(false);
    });
    const tra = { id: info.property_id }
    this.authService.pushTrash(tra).subscribe((data) => {
      console.log(data)
      // this.router.navigate(['/customer/trash']);
    }, (error) => {
      console.log(error)
    })
  }
  exportAsXLSX(): void {
    this.authService.getAllInterestedPropertyExcel().subscribe((data) => {
      this.exlTableData = data.data;
      this.excelService.exportAsExcelFile(this.exlTableData, 'Warm Prospects');
    });

  }

  manageGridSubmit(form: any) {
    var colOrder: any = [];
    var missingOrder = [];
    for (var i = 0; i < Object.keys(form).length - 1; i++) {
      colOrder[i] = parseInt(form['col' + i])
    }
    if (!this.checkIfArrayIsUnique(colOrder)) {
      //this.toastr.error('please select unique value in each column!', 'Error!');
      return;
    }
    this.authService.setGridList(this.manageGrid).subscribe((data) => {
      //console.log(data.data.message);
      this.toastr.success(data.message, 'Success!');
      $('#manageGridWarm').modal('hide');
      var tmpArr = colOrder.slice().sort();
      for (var i = 0, j = 0; i < 9; i++) {
        if (tmpArr[j] == i) {
          j++;
        } else {
          missingOrder.push(i);
        }
      }
      this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
        for (var i = 0; i < 9; i++) {
          dtInstance.column(i).visible(true, true);
        }
        dtInstance['colReorder'].order(colOrder.concat(missingOrder), true);
        for (var i: number = tmpArr.length; i < 9; i++) {
          dtInstance.column(i).visible(false, true);
        }
        dtInstance.columns.adjust().draw(false);

      });
      this.manageGrid.gridSelect = form.gridSelect;
      this.manageGrid.gridCol = colOrder.concat(missingOrder);
    });
  }
  checkIfArrayIsUnique(myArray) {
    for (var i = 0; i < myArray.length; i++) {
      for (var j = 0; j < myArray.length; j++) {
        if (i != j) {
          if (myArray[i] == myArray[j]) {
            this.toastr.error('"' + this.manageGrid.gridColName[this.manageGrid.gridCol[i]] + '" Coulmn can come only once!', 'Error!');
            return false;
          }
        }
      }
    }
    return true;
  }
  manageGridReset() {
    this.manageGrid.gridSelect = 8;
    this.manageGrid.gridsStatus = [false, false, false, false, false, false, false, false, false];
    this.manageGrid.gridCol = [0, 1, 2, 3, 4, 5, 6, 7, 8];
    $('#manageGrid').modal('hide');
    this.authService.setGridList(this.manageGrid).subscribe((data) => {
      this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
        for (var i = 0; i < 9; i++) {
          dtInstance.column(i).visible(true, true);
        }
        dtInstance.columns.adjust().draw(false);
        dtInstance['colReorder'].reset();
      });
    });
  }

  manageGridInit() {
    let colStatus = this.manageGrid.gridsStatus;
    let colOrder = this.manageGrid.gridCol;
    const nw=colOrder.map(item=>parseInt(item))
    console.log(nw)
    this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance['colReorder'].order( nw, true);
      for (var i = 0; i < 10; i++) {
        dtInstance.column(i).visible(colStatus[i], true);
      }
      dtInstance.columns.adjust().draw(false);
    });
  }
  resetFilters() {
    this.filter = false;
    this.filterObj.Owner1FirstName = '';
    this.filterObj.OwnerLastname1 = '';
    this.filterObj.SitusCity = '';
    // this.filterObj.status = null;  
    this.filterObj.address = '';
    this.filterObj.phone = '';
    this.filterObj.email = '';
    this.filterObj.SitusZipCode = '';
    this.filterObj.SitusState = '';
   
    this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.draw();
    });
  }


  
  manageGridModal():void{
    const that =this
    const modalRef = this.modal.open(SortableModalComponent);

    const main = []
    for(let i=0;i <this.manageGrid.gridCol.length;i++){
      main.push({item:this.manageGrid.gridCol[i],status:this.manageGrid.gridsStatus[i]})
    }
    modalRef.componentInstance.gridColName=this.manageGrid.gridColName
    modalRef.componentInstance.gridsStatus=this.manageGrid.gridsStatus
    modalRef.componentInstance.gridCol=this.manageGrid.gridCol
    modalRef.componentInstance.main=main 
    modalRef.componentInstance.type=1

    modalRef.result.then((data) => {
     if(data.type===0){
      this.manageGrid.gridsStatus = data.gridsStatus;
      this.manageGrid.gridCol = data.gridCol;
      this.manageGrid.gridColName = data.gridColName; 
      this.manageGrid.gridSelect = 10; 
      const gridData={
        gridCol: data.gridCol,
        gridColName:  data.gridColName,
        gridSelect: 10,
        gridsStatus: data.gridsStatus,
        type: 1
      }

      this.authService.setGridList(gridData).subscribe((data)=>{ 
        this.toastr.success("Grids saved successfully", 'Success!');   
      })
      that.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {   
        for( var i:number=0 ; i < 10; i++ ) {
          dtInstance.column(i).visible( true, true );
        }
        dtInstance['colReorder'].order([...this.manageGrid.gridCol],true);
        for( var i:number=0 ; i < 10; i++ ) {
          dtInstance.column(i).visible( data.gridsStatus[i], true );
        }
        dtInstance.columns.adjust().draw( false );    
      });
    } else if(data.type===1){
      const gridDefault=new ManageGrid()
      this.manageGrid.gridsStatus = gridDefault.gridsStatus;
      this.manageGrid.gridCol = gridDefault.gridCol;
      this.manageGrid.gridColName = gridDefault.gridColName; 
      this.manageGrid.gridSelect = 10; 
      const gridData={
        gridCol: gridDefault.gridCol,
        gridColName:  gridDefault.gridColName,
        gridSelect: 10,
        gridsStatus: gridDefault.gridsStatus,
        type: 1
      }

      this.authService.setGridList(gridData).subscribe((data)=>{ 
        this.toastr.success("Grids saved successfully", 'Success!');   
      })
      that.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {   
        for( var i:number=0 ; i < 10; i++ ) {
          dtInstance.column(i).visible( true, true );
        }
        dtInstance['colReorder'].order([...gridDefault.gridCol],true);
        dtInstance.columns.adjust().draw( false );    
      });   
    }
    }, (reason) => {
      // on dismiss
    });
  }

  searchFilter(){
    this.filter = false;
    this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.draw();
    });
    
    $('#prospectTbl').DataTable().ajax.reload();
}
  
}
