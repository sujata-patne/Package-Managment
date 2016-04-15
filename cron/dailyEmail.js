var mysql = require('../config/db').pool;
var CronJob = require('cron').CronJob;
var packageListManager = require('../models/packageListingModel');
var nodemailer = require('nodemailer');

new CronJob('60 * * * * 1-5', function () {
     autoEmail();
}, null, true, 'Asia/Kolkata');

// autoEmail();

function autoEmail() {
	mysql.getConnection('CMS', function (err, connection_ikon_cms) {
		packageListManager.getActivePackages( connection_ikon_cms, function(err,PackActive){
			if(err){
				connection_ikon_cms.release();
			}else{
				packageListManager.getBlockedPackages( connection_ikon_cms, function(err,PackBlock){
					if(err){
						connection_ikon_cms.release();
					}else{
						packageListManager.getDeletedPackages( connection_ikon_cms, function(err,PackDelete){
						if(err){
							connection_ikon_cms.release();
						}else{
							var str_html_head = "<table border='1' style='border-collapse:collapse'><th> Active Package Name </th>";
							var str_html_body = '';
							for(i = 0;i<PackActive.length;i++){
								str_html_body += " <tr><td>"+PackActive[i].sp_package_name+"</td></tr>";
							}

							var final_html_active = str_html_head + str_html_body +"</table>";

							var block_html_head = "<table border='1' style='border-collapse:collapse'><th> Blocked Package Name </th>";
							var block_html_body = '';
							for(i = 0;i<PackBlock.length;i++){
								block_html_body += " <tr><td>"+PackBlock[i].sp_package_name+"</td></tr>";
							}

							var final_html_block = block_html_head + block_html_body +"</table>";


							var delete_html_head = "<table border='1' style='border-collapse:collapse'><th> Deleted Package Name </th>";
							var delete_html_body = '';
							for(i = 0;i<PackDelete.length;i++){
								delete_html_body += " <tr><td>"+PackDelete[i].sp_package_name+"</td></tr>";
							}

							var final_html_delete = delete_html_head + delete_html_body +"</table>";

							var final_html = final_html_active + "<br/>" + final_html_block + "<br/>" + final_html_delete +"<br/> Thanks.";

							console.log(final_html);

							 var smtpTransport = nodemailer.createTransport({
	                            service: "Gmail",
	                            auth: {
	                                user: "jetsynthesis@gmail.com",
	                                pass: "j3tsynthes1s"
	                            }
	                        });

	                        
	                        var mailOptions = {
	                            to: PackActive[i].sp_created_by,//'sujata.patne@jetsynthesys.com',
	                            subject: 'List of Packages',
	                            html: " <p>Hi Admin, </p> "+final_html
	                        }
	                        smtpTransport.sendMail(mailOptions, function (error, response) {
	                            if (error) {
	                                console.log(error);
	                                // res.end("error");
	                            } else {
	                                connection_ikon_cms.release();
	                                console.log(" mail sent ");
	                                // res.end("sent");
	                            }
	                        });

	                     }
	                 });
                    }
				});
			}

		});	
   });
}