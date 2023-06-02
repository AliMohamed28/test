
$(document).ready(function () {
  var pollingTimer = null;
  var transactionStatus = $('input#transaction_current_status').val();
  var previousTransactionStatus = transactionStatus;
  var timerWait = parseInt(10) * 1000; // cast to milliseconds
  var timerInterval = parseInt(7) * 1000;
  var transactionCompletedStatus = parseInt(100);
  var transactionFailedStatus = parseInt(-20);
  var transactionExpiredStatus = parseInt(-21);
  var transactionQRCodeScannedStatus = parseInt(11);

  var isAndroid = 0;
  var isIos = 0;
  var itunesLink = 'https://itunes.apple.com/be/app/bancontact/id858371800';
  var googlePlayLink = 'https://play.google.com/store/apps/details?id=mobi.inthepocket.bcmc.bancontact';

  $('body').on('click', '#pay_on_mobile', function()
  {
      var urlIntent = $(this).data('urlintent');
      setTimeout(function() {
          if (isIos) {
              window.location = itunesLink;
          } else {
              if (isAndroid) {
                  window.location = googlePlayLink;
              }
          }
      }, 25);
      window.location = urlIntent;
  });

  $('#qrScanned').on('click', rescanQR);
  $('#qrScanned').on('mouseenter', function () {
      $('.qrClosingCross').animate({
          opacity: 1
      }, 50);
  }).on('mouseleave', function () {
      $('.qrClosingCross').animate({
          opacity: 0.4
      }, 50);
  });

  var awaitingTimer = setTimeout(function () {
      poll();
      clearTimeout(awaitingTimer);
  }, timerWait);


  function poll() {
      if (transactionStatus === transactionCompletedStatus) {
          if (pollingTimer !== null) {
              clearTimeout(pollingTimer);
          }
      } else {
          if (transactionStatus === transactionQRCodeScannedStatus) {
              // cast to milliseconds
              timerWait = parseInt(5) * 1000;
              timerInterval = parseInt(5) * 1000;
              setTimeout('', timerWait);
          }
          const transactionStatusUrl = "https://card.pay.nl/bancontact/check/ekx5NVJnZW1zcFpC";
          if (transactionStatusUrl === "") {
              return;
          }
          pollingTimer = setTimeout(function() {
              $.ajax({
                  url: transactionStatusUrl,
                  dataType : "json",
                  success: function (data) {
                      var mainContainer = $('div#main_container');
                      if ($(data).has('statusCode')) {

                          transactionStatus = data.statusCode;

                          if(previousTransactionStatus == transactionStatus) {
                              return;
                          }
                          previousTransactionStatus = transactionStatus;

                          $("#qrStatus").fadeOut(150, function () {
                              $("#qrStatus").text(data.statusDescription).fadeIn(150);
                          });

                          if (transactionStatus === transactionCompletedStatus ||
                              transactionStatus === transactionFailedStatus ||
                              transactionStatus === transactionExpiredStatus) {

                              $(mainContainer).find('div.form_container').hide();
                              $(mainContainer).find('div.details_action_block').removeClass('hidden');
                              $(mainContainer).find('div.transaction_final_status').fadeOut(150, function () {
                                  $(mainContainer).find('div.transaction_final_status').text(data.statusDescription).fadeIn(150);
                              });
                              if (data.statusCode === transactionFailedStatus ||
                                  data.statusCode === transactionExpiredStatus) {
                                  $(mainContainer).find('div.transaction_final_status').addClass('text-danger');
                                  showQrFinished();
                              } else {
                                  if (transactionStatus === transactionCompletedStatus) {
                                      showQrPaid();
                                  }
                                  window.location.replace("https://card.pay.nl/complete/2097745974Xfcc9a/b5269f0728d2319e/nl/?redirect=1");
                              }
                          } else if (data.statusCode === transactionQRCodeScannedStatus) {

                              showQrScanned();

                              if ($(mainContainer).find('div.qr_code_group div#transaction_status').length > 0) {
                                  $(mainContainer).find('div.qr_code_group div#transaction_status').fadeOut(150, function () {
                                      $(mainContainer).find('div.qr_code_group div#transaction_status').text(data.statusDescription).fadeIn(150);
                                  });
                              } else {
                                  $(mainContainer).find('div.transaction_final_status').fadeOut(150, function () {
                                      $(mainContainer).find('div.transaction_final_status').text(data.statusDescription).fadeIn(150);
                                  });
                              }
                          }
                      } else {
                          $(mainContainer).html(data.content);
                      }

                  },
                  complete: poll
              });
          }, timerInterval);
      }
  }
});
function showQrScanned() {
  var imageHeight = jQuery('#qrCode').height();
  var imageWidth = jQuery('#qrCode').width();
  var margin = Math.round(imageHeight / 2) - 40;//80 px is the div height
  jQuery('.lds-css').css('margin-top', margin + 'px');
  jQuery('#qrCode').animate({
      opacity: 0.3
  }, 300);
  $('#qrScanned').height(imageHeight).width(imageWidth).fadeIn(300);
}
function rescanQR() {
  jQuery('#qrCode').animate({
      opacity: 1
  }, 200);
  $('#qrScanned').fadeOut();
}
function showQrFinished() {
  $('#qrCode').hide();
  $('#qrScanned').fadeOut(200, function(){
      $('#qrWrap').animate({'min-height':'25px'});
      $('#qr').animate({'min-height':'70px'});
  });
}
function showQrPaid() {
  $('#qrScanned .lds-css, .qrClosingCross, #qrCode').fadeOut(200, function(){
      $('#qrScanned').css('opacity', '0').addClass('qrPaid').show().animate({'opacity': '1'});
      $('#qrWrap').animate({'min-height': '110px'});
      $('#qr').animate({'min-height':'160px'});
  });
}