(function(){
	"use strict";

var applicationName = "users-environment";
 var environmentName = "users";
 var regionName = "us-east-1";


	var AWS = require('aws-sdk');
 AWS.config.update({region: regionName});

 var applicationParams = {
   ApplicationName: applicationName
 };

 var environmentParams =
 {
	 ApplicationName: applicationName, /* required */
	 EnvironmentName: environmentName, /* required */
	 VersionLabel: 'initial',
	SolutionStackName: "64bit Amazon Linux 2016.03 v2.1.3 running Node.js",
	 CNAMEPrefix: applicationName,
	 Tier:
	 {
		 Version: " ",
		 Type: "Standard",
		 Name: "WebServer"
	 },
	 OptionSettings:
	 [
		 {
			 Namespace: 'aws:elasticbeanstalk:environment',
			 OptionName: 'EnvironmentType',
			 Value: 'LoadBalanced'
		 },
		 {
			 Namespace: 'aws:autoscaling:launchconfiguration',
			 OptionName: 'EC2KeyName',
			 //Value: 'aws'
			 Value: 'aws_user_key_pair'
		 },
		 {
			 Namespace: 'aws:autoscaling:launchconfiguration',
			 OptionName: 'IamInstanceProfile',
			 Value: 'aws-elasticbeanstalk-ec2-role'
		 },
		 {
			 Namespace: 'aws:autoscaling:launchconfiguration',
			 OptionName: 'InstanceType',
			 Value: 't1.micro'
		 }
	 ],
  };

 var versionParams =
 {
	 ApplicationName: applicationName, /* required */
	 VersionLabel: 'initial', /* required */
	 AutoCreateApplication: true,
	 SourceBundle:
	 {
		 S3Bucket: 'test.collectors-db.com',
		 S3Key: 'nodejs-v1.zip'
	 }
	// SourceBuildInformation: {
	// 	SourceLocation: 'STRING_VALUE', /* required */
	// 	SourceRepository: 'CodeCommit', /* required */
	// 	SourceType: 'Git' /* required */
	// }
 };

 var elasticbeanstalk = new AWS.ElasticBeanstalk({sslEnabled: true});

 function checkAvailability(){
	var params = {
		EnvironmentNames: [environmentName]
	};

 	elasticbeanstalk.describeEnvironments(params, function(err, data) {
	   if (err) {
	   		console.log(err, err.stack); 
	   	} else {
	   		console.log(data);
	   		var instance = data.Environments[0];
	   		console.info(instance.Health);
	   		console.info(instance.Status);
	   		if (instance.Health === "Green" && instance.Status === "Ready"){
	   			console.info("we have a deployment!!!!");
	   			console.info("DONE");
	   		} else {
	   			console.info("still waiting . . .");
	   			setTimeout(checkAvailability,10000);
	   		}
	   	}
	});
 }


//checkAvailability();

function deleteApplication(){ // does not working within a running enviroment
	var params = {
		ApplicationName: applicationName
	};

	elasticbeanstalk.deleteApplication(params, function(err, data) {
		if (err) {
			console.log(err, err.stack); 
		} else{
			console.log(data); 
		}
	});
}

function deleteEnviroment(){
	var params = {
		EnvironmentName: environmentName
	};

	elasticbeanstalk.terminateEnvironment(params, function(err, data) {
		if (err) {
			console.log(err, err.stack); 
		} else {  
			console.log(data);  
		}

	});
}

function describeApplications(){
	var params = {
		ApplicationNames: [applicationName]
	};

	elasticbeanstalk.describeApplications(params, function(err, data) {
		if (err) console.log(err, err.stack); // an error occurred
		else     console.log(data);           // successful response
	});
}

//deleteEnviroment();

create();

function create(){
	elasticbeanstalk.createApplication(applicationParams, function(err, data){
		 console.log('Creating application');
		 console.log(data);
		 if (err)
		 {
			 if (err.message.indexOf("already exists") > -1)
			 {
				 console.log('Application already exists, continuing on');
			 }
			 else
			 {
				 console.log(err,err.stack); // an error occurred
			 }
		 }
		 else
		 {
			 elasticbeanstalk.createApplicationVersion(versionParams, function(err, data)
			 {
				 console.log('Creating application version....');
				 console.log(data);

				 if (err) console.log(err, err.stack); // an error occurred

				 else
				 {
					 elasticbeanstalk.createEnvironment(environmentParams, function(err, data)
					 {
						 console.log('Creating application environment....');
						 console.log(data);

						 setTimeout(checkAvailability, 10000);
						if (err) console.log(err, err.stack); // an error occurred

					 });
				 }
			 });
		 }
	});
}


})();
