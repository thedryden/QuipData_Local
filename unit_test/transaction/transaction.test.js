describe('transaction.js', function(){

	before(function(done){
	    	this.timeout( 1 * 60 * 1000 );//1 minute

			localTransTest();
			$('#transaction').html('<iframe src="transaction.test.remote.html?' + fbModelRef + '"></iframe>');
			modelLoaded( 0 );
			onModelLoadedComplete = function(){
				done();
			}		
	})

	describe('createTransaction()', function(){
		it('Can create a single transaction', function(){
			var actions = [
				{	"objectID" : "#/Model/Model/ModelObjects/e4644cb4-1624-4c46-966f-961595f64d17",
					"commandType" : "insert",
					"value" : {
					    "id": "#/Model/Model/ModelObjects/e4644cb4-1624-4c46-966f-961595f64d17",
					    "name": "",
					    "type": "Object",
					    "notes": "",
					    "ModelRelationshipConnectors": { "empty":"" }
					}
				}
			]
			
			var trans = master.transaction.createTransaction( "Model", actions );
			
			var test = {"6c6f6d96-0a67-4ecd-a077-a7581702864a":{"id":"#/Model/Model/TransactionLog/Transactions/6c6f6d96-0a67-4ecd-a077-a7581702864a","transactionType":"Model","modifiedBy":"e4644cb4-1624-4c46-966f-961595f64d17","modifiedOn":"2014-08-12T03:29:25.396Z","Actions":{"bb4bb8aa-ee1b-4cc9-be51-49bf8c01cb27":{"id":"#/Model/Model/TransactionLog/Transactions/6c6f6d96-0a67-4ecd-a077-a7581702864a/Actions/bb4bb8aa-ee1b-4cc9-be51-49bf8c01cb27","objectID":"#/Model/Model/ModelObjects/e4644cb4-1624-4c46-966f-961595f64d17","changeUI":false,"changeRemote":true,"commandType":"insert","value":{"id":"#/Model/Model/ModelObjects/e4644cb4-1624-4c46-966f-961595f64d17","name":"","type":"Object","notes":"","ModelRelationshipConnectors":{"empty":""}}}}}};
			
			expect(JSONEqual( trans, test )).to.be.true;
	   });
	   
	   it('Can create two transactions', function(){
			var actions = [
				{	"objectID" : "#/Model/Model/ModelObjects/e4644cb4-1624-4c46-966f-961595f64d17",
					"commandType" : "insert",
					"value" : {
					    "id": "#/Model/Model/ModelObjects/e4644cb4-1624-4c46-966f-961595f64d17",
					    "name": "",
					    "type": "Object",
					    "notes": "",
					    "ModelRelationshipConnectors": { "empty":"" }
					}
				}
			]
			
			var trans = master.transaction.createTransaction( "Model", actions );
			
			var visualActions = [
				{	"objectID" : "#/VisualModel/groups/98ec0430-2956-4b14-9590-10b74ca9ed1d",
					"commandType" : "insert",
					"value" : {
					    "type": "Object",
					    "id": "#/VisualModel/groups/98ec0430-2956-4b14-9590-10b74ca9ed1d",
					    "modelID": "#/Model/Model/ModelObjects/dc8c3706-b25c-4682-8cb6-9866de4f626d",
					    "selectedBy": "default",
					    "attr": {
							x: 100,
							y: 100,
							draggable: true
						},
					    "function": {},
					    "objects": {}
					}
				}
			]
			
			visualActions[0]['value']['objects']["956bec1a-12c6-4c57-ae58-f2dee6443574"] = {
			    "id": "#/VisualModel/groups/98ec0430-2956-4b14-9590-10b74ca9ed1d/objects/956bec1a-12c6-4c57-ae58-f2dee6443574",
			    "modelID": "#/Model/Model/ModelObjects/dc8c3706-b25c-4682-8cb6-9866de4f626d",
			    "class": "Rect",
			    "attr": {
					width: 40,
					height: 40,
					stroke: 'black',
					strokeWidth: 1,
					cornerRadius: 8,
					fill: 'white',
					name: 'content'
				},
			    "function": {},
			    "links": {"empty":""}
			}
			
			trans = master.transaction.createTransaction( "VisualModel", visualActions, trans );
			var test = {"608791f5-d0a3-418c-ab3d-ce5cc09ae34e":{"id":"#/Model/Model/TransactionLog/Transactions/608791f5-d0a3-418c-ab3d-ce5cc09ae34e","transactionType":"Model","modifiedBy":"e4644cb4-1624-4c46-966f-961595f64d17","modifiedOn":"2014-08-12T04:56:29.363Z","Actions":{"de32c0ed-d648-4f39-afb5-2bf823b5b9c2":{"id":"#/Model/Model/TransactionLog/Transactions/608791f5-d0a3-418c-ab3d-ce5cc09ae34e/Actions/de32c0ed-d648-4f39-afb5-2bf823b5b9c2","objectID":"#/Model/Model/ModelObjects/e4644cb4-1624-4c46-966f-961595f64d17","changeUI":false,"changeRemote":true,"commandType":"insert","value":{"id":"#/Model/Model/ModelObjects/e4644cb4-1624-4c46-966f-961595f64d17","name":"","type":"Object","notes":"","ModelRelationshipConnectors":{"empty":""}}}}},"a0fb4add-ab09-4e07-91fa-788a7f16ec47":{"id":"#/VisualModel/TransactionLog/Transactions/a0fb4add-ab09-4e07-91fa-788a7f16ec47","transactionType":"VisualModel","modifiedBy":"e4644cb4-1624-4c46-966f-961595f64d17","modifiedOn":"2014-08-12T04:56:29.364Z","Actions":{"12276bd4-424c-42cc-8327-73ee32432b0a":{"id":"#/VisualModel/TransactionLog/Transactions/a0fb4add-ab09-4e07-91fa-788a7f16ec47/Actions/12276bd4-424c-42cc-8327-73ee32432b0a","objectID":"#/VisualModel/groups/98ec0430-2956-4b14-9590-10b74ca9ed1d","changeUI":true,"changeRemote":true,"commandType":"insert","value":{"type":"Object","id":"#/VisualModel/groups/98ec0430-2956-4b14-9590-10b74ca9ed1d","modelID":"#/Model/Model/ModelObjects/dc8c3706-b25c-4682-8cb6-9866de4f626d","selectedBy":"default","attr":{"x":100,"y":100,"draggable":true},"function":{},"objects":{"956bec1a-12c6-4c57-ae58-f2dee6443574":{"id":"#/VisualModel/groups/98ec0430-2956-4b14-9590-10b74ca9ed1d/objects/956bec1a-12c6-4c57-ae58-f2dee6443574","modelID":"#/Model/Model/ModelObjects/dc8c3706-b25c-4682-8cb6-9866de4f626d","class":"Rect","attr":{"width":40,"height":40,"stroke":"black","strokeWidth":1,"cornerRadius":8,"fill":"white","name":"content"},"function":{},"links":{"empty":""}}}}}}}};
			
			expect(JSONEqual( trans, test )).to.be.true;
	   });
	    
	    it('fail if no prameters passed', function(){
	    	try{
	    		master.transaction.createTransaction();
	    		throw new Error( 'Function did not fail' );
	    	}catch( err ){
	    		expect( err.message ).to.equals( '_transactionType not provided or not a valid value' )	
	    	}
	    })
	    
	    it('fail if only _transactionType is passed', function(){
	    	try{
	    		master.transaction.createTransaction( 'VisualModel' );
	    		throw new Error( 'Function did not fail' );
	    	}catch( err ){
	    		expect( err.message ).to.equals( '_actionParams not provided' )	
	    	}
	    })
	    
	    it('insert update and delete all work locally and remotely', function(){
			var testModel = {"Model":{"Model":{"ModelObjects":{"empty":"","d645fd1e-d0af-4c26-94db-668677915761":{"id":"#/Model/Model/ModelObjects/d645fd1e-d0af-4c26-94db-668677915761","name":"Person","type":"Object","notes":"","ModelRelationshipConnectors":{"empty":""},"version":1}},"ModelRelationships":{"empty":""},"ModelRules":{"empty":""},"TransactionLog":{"ObjectLogs":{"empty":"","d645fd1e-d0af-4c26-94db-668677915761":{"ActionPairs":{"a6aade64-ebbc-4c6c-b050-8e8c8b8228bb":{"currentAction":"#/Model/Model/TransactionLog/Transactions/b07863ae-dea8-47ed-8003-fa1b7293d18e/Actions/a597ee67-5ab9-4be6-8bda-2fe163cb6e37"},"d2f06329-c1dc-45a5-b96f-1eaa3456536f":{"PreviousPair":"#/Model/Model/TransactionLog/ObjectLogs/d645fd1e-d0af-4c26-94db-668677915761/ActionPairs/a6aade64-ebbc-4c6c-b050-8e8c8b8228bb","currentAction":"#/Model/Model/TransactionLog/Transactions/862ade2e-5277-4f38-b2cc-eed211de8779/Actions/43d8ebe0-4b31-4741-9b35-37ecd71ec5a3"},"empty":""},"head":"#/Model/Model/TransactionLog/ObjectLogs/d645fd1e-d0af-4c26-94db-668677915761/ActionPairs/d2f06329-c1dc-45a5-b96f-1eaa3456536f","id":"#/Model/Model/TransactionLog/ObjectLogs/d645fd1e-d0af-4c26-94db-668677915761","objectID":"#/Model/Model/ModelObjects/d645fd1e-d0af-4c26-94db-668677915761"}},"TransactionLog":{"empty":"","-JUHfN2VrbiSnvWuef05":"#/Model/Model/TransactionLog/Transactions/b07863ae-dea8-47ed-8003-fa1b7293d18e","-JUHfN2nFvdHx3q2q5Pz":"#/Model/Model/TransactionLog/Transactions/862ade2e-5277-4f38-b2cc-eed211de8779"},"Transactions":{"empty":"","b07863ae-dea8-47ed-8003-fa1b7293d18e":{"Actions":{"a597ee67-5ab9-4be6-8bda-2fe163cb6e37":{"changeRemote":true,"changeUI":false,"commandType":"insert","id":"#/Model/Model/TransactionLog/Transactions/b07863ae-dea8-47ed-8003-fa1b7293d18e/Actions/a597ee67-5ab9-4be6-8bda-2fe163cb6e37","objectID":"#/Model/Model/ModelObjects/d645fd1e-d0af-4c26-94db-668677915761","reverseAction":{"changeRemote":true,"changeUI":false,"commandType":"delete"},"value":{"ModelRelationshipConnectors":{"empty":""},"id":"#/Model/Model/ModelObjects/d645fd1e-d0af-4c26-94db-668677915761","name":"","notes":"","type":"Object","version":0}}},"id":"#/Model/Model/TransactionLog/Transactions/b07863ae-dea8-47ed-8003-fa1b7293d18e","modifiedBy":"e4644cb4-1624-4c46-966f-961595f64d17","modifiedOn":"2014-08-14T04:01:33.382Z","transactionType":"Model"},"862ade2e-5277-4f38-b2cc-eed211de8779":{"Actions":{"43d8ebe0-4b31-4741-9b35-37ecd71ec5a3":{"changeRemote":true,"changeUI":false,"commandType":"update","id":"#/Model/Model/TransactionLog/Transactions/862ade2e-5277-4f38-b2cc-eed211de8779/Actions/43d8ebe0-4b31-4741-9b35-37ecd71ec5a3","objectID":"#/Model/Model/ModelObjects/d645fd1e-d0af-4c26-94db-668677915761","reverseAction":{"changeRemote":true,"changeUI":false,"commandType":"update","value":{"ModelRelationshipConnectors":{"empty":""},"id":"#/Model/Model/ModelObjects/d645fd1e-d0af-4c26-94db-668677915761","name":"","notes":"","type":"Object","version":0}},"value":{"ModelRelationshipConnectors":{"empty":""},"id":"#/Model/Model/ModelObjects/d645fd1e-d0af-4c26-94db-668677915761","name":"Person","notes":"","type":"Object","version":1}}},"id":"#/Model/Model/TransactionLog/Transactions/862ade2e-5277-4f38-b2cc-eed211de8779","modifiedBy":"e4644cb4-1624-4c46-966f-961595f64d17","modifiedOn":"2014-08-14T04:01:33.406Z","transactionType":"Model"}}},"metadata":{"createdOn":"","creator":"","editors":"","id":"","modifiedDate":"","name":"","type":""}},"ModelRefs":{"empty":""}},"TransactionLog":{"empty":"","-JUHfN2jz6KGqvwZx6CT":{"ModelTransaction":"#/Model/Model/TransactionLog/Transactions/b07863ae-dea8-47ed-8003-fa1b7293d18e","VisualModelTransaction":"#/VisualModel/TransactionLog/Transactions/c191691d-7a73-4c93-9690-4e09e26cdd7d"},"-JUHfN315tEak4LIKw-t":{"ModelTransaction":"#/Model/Model/TransactionLog/Transactions/862ade2e-5277-4f38-b2cc-eed211de8779","VisualModelTransaction":"#/VisualModel/TransactionLog/Transactions/4ab9334a-ffab-411a-90e9-712a13f5b719"},"-JUHfN39UC1ZG20COU1Q":{"VisualModelTransaction":"#/VisualModel/TransactionLog/Transactions/5876353f-9269-49fb-97f4-41131e561a64"},"-JUHfNGwJTR7vsXqVza9":{"VisualModelTransaction":"#/VisualModel/TransactionLog/Transactions/781fb0d6-942e-41f4-ad1d-62385e8b44c4"}},"VisualModel":{"TransactionLog":{"ObjectLogs":{"empty":"","01b1be00-8cfc-4e30-94b9-89422ddfab9b":{"ActionPairs":{"74b855ff-85bb-41f3-8370-f04e3f12ea00":{"currentAction":"#/VisualModel/TransactionLog/Transactions/c191691d-7a73-4c93-9690-4e09e26cdd7d/Actions/a8cb3680-eb27-498c-a4d6-e47d853c797e"},"e2b91acb-5089-4468-af77-3860b76579c9":{"PreviousPair":"#/VisualModel/TransactionLog/ObjectLogs/01b1be00-8cfc-4e30-94b9-89422ddfab9b/ActionPairs/74b855ff-85bb-41f3-8370-f04e3f12ea00","currentAction":"#/VisualModel/TransactionLog/Transactions/4ab9334a-ffab-411a-90e9-712a13f5b719/Actions/3aa8ca24-e59d-4d05-a0b2-60a359d18495"},"empty":""},"head":"#/VisualModel/TransactionLog/ObjectLogs/01b1be00-8cfc-4e30-94b9-89422ddfab9b/ActionPairs/e2b91acb-5089-4468-af77-3860b76579c9","id":"#/VisualModel/TransactionLog/ObjectLogs/01b1be00-8cfc-4e30-94b9-89422ddfab9b","objectID":"#/VisualModel/groups/01b1be00-8cfc-4e30-94b9-89422ddfab9b"},"bc22185f-0d6c-468a-9267-54466f666821":{"ActionPairs":{"2adfb757-9fa3-4369-b658-b1a358b5c981":{"currentAction":"#/VisualModel/TransactionLog/Transactions/5876353f-9269-49fb-97f4-41131e561a64/Actions/f4e16aba-1167-4c97-9625-99d08a8a483b"},"c0998a57-a493-40be-a072-2b7346568511":{"PreviousPair":"#/VisualModel/TransactionLog/ObjectLogs/bc22185f-0d6c-468a-9267-54466f666821/ActionPairs/2adfb757-9fa3-4369-b658-b1a358b5c981","currentAction":"#/VisualModel/TransactionLog/Transactions/781fb0d6-942e-41f4-ad1d-62385e8b44c4/Actions/cb9d4cbe-c00b-4d32-b6b5-248c7f46ffe7"},"empty":""},"head":"#/VisualModel/TransactionLog/ObjectLogs/bc22185f-0d6c-468a-9267-54466f666821/ActionPairs/c0998a57-a493-40be-a072-2b7346568511","id":"#/VisualModel/TransactionLog/ObjectLogs/bc22185f-0d6c-468a-9267-54466f666821","objectID":"#/VisualModel/comments/bc22185f-0d6c-468a-9267-54466f666821"}},"TransactionLog":{"empty":"","-JUHfN2dKKS8bVwi63DF":"#/VisualModel/TransactionLog/Transactions/c191691d-7a73-4c93-9690-4e09e26cdd7d","-JUHfN2wo_Y6l-KtnOlY":"#/VisualModel/TransactionLog/Transactions/4ab9334a-ffab-411a-90e9-712a13f5b719","-JUHfN35EZw4OoBvQhK9":"#/VisualModel/TransactionLog/Transactions/5876353f-9269-49fb-97f4-41131e561a64","-JUHfNGs4yurW9OKYjfV":"#/VisualModel/TransactionLog/Transactions/781fb0d6-942e-41f4-ad1d-62385e8b44c4"},"Transactions":{"empty":"","c191691d-7a73-4c93-9690-4e09e26cdd7d":{"Actions":{"a8cb3680-eb27-498c-a4d6-e47d853c797e":{"changeRemote":true,"changeUI":true,"commandType":"insert","id":"#/VisualModel/TransactionLog/Transactions/c191691d-7a73-4c93-9690-4e09e26cdd7d/Actions/a8cb3680-eb27-498c-a4d6-e47d853c797e","objectID":"#/VisualModel/groups/01b1be00-8cfc-4e30-94b9-89422ddfab9b","reverseAction":{"changeRemote":true,"changeUI":true,"commandType":"delete"},"value":{"attr":{"draggable":true,"x":100,"y":100},"id":"#/VisualModel/groups/01b1be00-8cfc-4e30-94b9-89422ddfab9b","modelID":"#/Model/Model/ModelObjects/d645fd1e-d0af-4c26-94db-668677915761","objects":{"3130f170-8728-4e44-aa83-1c5a0c04aa2b":{"attr":{"cornerRadius":8,"fill":"white","height":40,"name":"content","stroke":"black","strokeWidth":1,"width":40},"class":"Rect","id":"#/VisualModel/groups/01b1be00-8cfc-4e30-94b9-89422ddfab9b/objects/3130f170-8728-4e44-aa83-1c5a0c04aa2b","links":{"empty":""},"modelID":"#/Model/Model/ModelObjects/d645fd1e-d0af-4c26-94db-668677915761"}},"selectedBy":"default","type":"Object","version":0}}},"id":"#/VisualModel/TransactionLog/Transactions/c191691d-7a73-4c93-9690-4e09e26cdd7d","modifiedBy":"e4644cb4-1624-4c46-966f-961595f64d17","modifiedOn":"2014-08-14T04:01:33.383Z","transactionType":"VisualModel"},"4ab9334a-ffab-411a-90e9-712a13f5b719":{"Actions":{"3aa8ca24-e59d-4d05-a0b2-60a359d18495":{"changeRemote":true,"changeUI":true,"commandType":"update","id":"#/VisualModel/TransactionLog/Transactions/4ab9334a-ffab-411a-90e9-712a13f5b719/Actions/3aa8ca24-e59d-4d05-a0b2-60a359d18495","objectID":"#/VisualModel/groups/01b1be00-8cfc-4e30-94b9-89422ddfab9b","reverseAction":{"changeRemote":true,"changeUI":true,"commandType":"update","value":{"attr":{"draggable":true,"x":100,"y":100},"id":"#/VisualModel/groups/01b1be00-8cfc-4e30-94b9-89422ddfab9b","modelID":"#/Model/Model/ModelObjects/d645fd1e-d0af-4c26-94db-668677915761","objects":{"3130f170-8728-4e44-aa83-1c5a0c04aa2b":{"attr":{"cornerRadius":8,"fill":"white","height":40,"name":"content","stroke":"black","strokeWidth":1,"width":40},"class":"Rect","id":"#/VisualModel/groups/01b1be00-8cfc-4e30-94b9-89422ddfab9b/objects/3130f170-8728-4e44-aa83-1c5a0c04aa2b","links":{"empty":""},"modelID":"#/Model/Model/ModelObjects/d645fd1e-d0af-4c26-94db-668677915761"}},"selectedBy":"default","type":"Object","version":0}},"value":{"attr":{"draggable":true,"x":100,"y":100},"id":"#/VisualModel/groups/01b1be00-8cfc-4e30-94b9-89422ddfab9b","modelID":"#/Model/Model/ModelObjects/d645fd1e-d0af-4c26-94db-668677915761","objects":{"3130f170-8728-4e44-aa83-1c5a0c04aa2b":{"attr":{"cornerRadius":8,"fill":"white","height":40,"name":"content","stroke":"black","strokeWidth":1,"width":40},"class":"Rect","id":"#/VisualModel/groups/01b1be00-8cfc-4e30-94b9-89422ddfab9b/objects/3130f170-8728-4e44-aa83-1c5a0c04aa2b","links":{"empty":""},"modelID":"#/Model/Model/ModelObjects/d645fd1e-d0af-4c26-94db-668677915761"},"9c2b1aaa-c4de-479c-9bc8-f4b932206aa2":{"attr":{"fill":"black","fontFamily":"Calibri","fontSize":10,"text":"Person","x":5,"y":10},"class":"Text","id":"#/VisualModel/groups/01b1be00-8cfc-4e30-94b9-89422ddfab9b/objects/9c2b1aaa-c4de-479c-9bc8-f4b932206aa2","links":{"empty":""},"modelID":"#/Model/Model/ModelObjects/d645fd1e-d0af-4c26-94db-668677915761"}},"selectedBy":"default","type":"Object","version":1}}},"id":"#/VisualModel/TransactionLog/Transactions/4ab9334a-ffab-411a-90e9-712a13f5b719","modifiedBy":"e4644cb4-1624-4c46-966f-961595f64d17","modifiedOn":"2014-08-14T04:01:33.406Z","transactionType":"VisualModel"},"5876353f-9269-49fb-97f4-41131e561a64":{"Actions":{"f4e16aba-1167-4c97-9625-99d08a8a483b":{"changeRemote":true,"changeUI":true,"commandType":"insert","id":"#/VisualModel/TransactionLog/Transactions/5876353f-9269-49fb-97f4-41131e561a64/Actions/f4e16aba-1167-4c97-9625-99d08a8a483b","objectID":"#/VisualModel/comments/bc22185f-0d6c-468a-9267-54466f666821","reverseAction":{"changeRemote":true,"changeUI":true,"commandType":"delete"},"value":{"attr":{"draggable":true,"x":100,"y":100},"id":"#/VisualModel/comments/bc22185f-0d6c-468a-9267-54466f666821","objects":{"fcb9233c-e64b-42cf-96fe-2d5111ae8633":{"attr":{"cornerRadius":8,"fill":"yellow","height":40,"name":"content","stroke":"black","strokeWidth":1,"width":40},"class":"Rect","id":"#/VisualModel/comments/bc22185f-0d6c-468a-9267-54466f666821/objects/fcb9233c-e64b-42cf-96fe-2d5111ae8633","links":{"empty":""}}},"selectedBy":"default","version":0}}},"id":"#/VisualModel/TransactionLog/Transactions/5876353f-9269-49fb-97f4-41131e561a64","modifiedBy":"e4644cb4-1624-4c46-966f-961595f64d17","modifiedOn":"2014-08-14T04:01:33.425Z","transactionType":"VisualModel"},"781fb0d6-942e-41f4-ad1d-62385e8b44c4":{"Actions":{"cb9d4cbe-c00b-4d32-b6b5-248c7f46ffe7":{"changeRemote":true,"changeUI":true,"commandType":"delete","id":"#/VisualModel/TransactionLog/Transactions/781fb0d6-942e-41f4-ad1d-62385e8b44c4/Actions/cb9d4cbe-c00b-4d32-b6b5-248c7f46ffe7","objectID":"#/VisualModel/comments/bc22185f-0d6c-468a-9267-54466f666821","reverseAction":{"changeRemote":true,"changeUI":true,"commandType":"insert","value":{"attr":{"draggable":true,"x":100,"y":100},"id":"#/VisualModel/comments/bc22185f-0d6c-468a-9267-54466f666821","objects":{"fcb9233c-e64b-42cf-96fe-2d5111ae8633":{"attr":{"cornerRadius":8,"fill":"yellow","height":40,"name":"content","stroke":"black","strokeWidth":1,"width":40},"class":"Rect","id":"#/VisualModel/comments/bc22185f-0d6c-468a-9267-54466f666821/objects/fcb9233c-e64b-42cf-96fe-2d5111ae8633","links":{"empty":""}}},"selectedBy":"default","version":0}}}},"id":"#/VisualModel/TransactionLog/Transactions/781fb0d6-942e-41f4-ad1d-62385e8b44c4","modifiedBy":"ca339d28-9a90-4c4c-867f-51c6bfb616d6","modifiedOn":"2014-08-14T04:01:34.302Z","transactionType":"VisualModel"}}},"comments":{"empty":""},"groups":{"empty":"","01b1be00-8cfc-4e30-94b9-89422ddfab9b":{"type":"Object","id":"#/VisualModel/groups/01b1be00-8cfc-4e30-94b9-89422ddfab9b","modelID":"#/Model/Model/ModelObjects/d645fd1e-d0af-4c26-94db-668677915761","selectedBy":"default","attr":{"x":100,"y":100,"draggable":true},"function":{},"objects":{"3130f170-8728-4e44-aa83-1c5a0c04aa2b":{"id":"#/VisualModel/groups/01b1be00-8cfc-4e30-94b9-89422ddfab9b/objects/3130f170-8728-4e44-aa83-1c5a0c04aa2b","modelID":"#/Model/Model/ModelObjects/d645fd1e-d0af-4c26-94db-668677915761","class":"Rect","attr":{"width":40,"height":40,"stroke":"black","strokeWidth":1,"cornerRadius":8,"fill":"white","name":"content"},"function":{},"links":{"empty":""}},"9c2b1aaa-c4de-479c-9bc8-f4b932206aa2":{"id":"#/VisualModel/groups/01b1be00-8cfc-4e30-94b9-89422ddfab9b/objects/9c2b1aaa-c4de-479c-9bc8-f4b932206aa2","modelID":"#/Model/Model/ModelObjects/d645fd1e-d0af-4c26-94db-668677915761","class":"Text","attr":{"x":5,"y":10,"fontSize":10,"fontFamily":"Calibri","fill":"black","text":"Person"},"function":{},"links":{"empty":""}}},"version":1}},"links":{"empty":""},"metadata":{"id":"","name":"","type":""}},"loaded":true};
	    	
			expect(JSONEqual( master.model, testModel )).to.be.true;
	    })
  })
})
    
function localTransTest(){
	var newModelID = uuid.v4();

	var actions = [
		{	"objectID" : "#/Model/Model/ModelObjects/" + newModelID,
			"commandType" : "insert",
			"value" : {
			    "id": "#/Model/Model/ModelObjects/" + newModelID,
			    "name": "",
			    "type": "Object",
			    "notes": "",
			    "ModelRelationshipConnectors": { "empty":"" }
			}
		}
	]
	
	var trans = master.transaction.createTransaction( "Model", actions );
	
	var newID = uuid.v4();
	var objID = uuid.v4();
	
	var visualActions = [
		{	"objectID" : "#/VisualModel/groups/" + newID,
			"commandType" : "insert",
			"value" : {
			    "type": "Object",
			    "id": "#/VisualModel/groups/"  + newID,
			    "modelID": "#/Model/Model/ModelObjects/" + newModelID,
			    "selectedBy": "default",
			    "attr": {
					x: 100,
					y: 100,
					draggable: true
				},
			    "function": {},
			    "objects": {}
			}
		}
	]
	
	visualActions[0]['value']['objects'][objID] = {
	    "id": "#/VisualModel/groups/" + newID + "/objects/" + objID,
	    "modelID": "#/Model/Model/ModelObjects/" + newModelID,
	    "class": "Rect",
	    "attr": {
			width: 40,
			height: 40,
			stroke: 'black',
			strokeWidth: 1,
			cornerRadius: 8,
			fill: 'white',
			name: 'content'
		},
	    "function": {},
	    "links": {"empty":""}
	}
	
	var vaString = JSON.stringify( visualActions );
	var va2 = $.parseJSON( vaString );
	va2[0].commandType = 'update';
	
	objID = uuid.v4();
	
	va2[0]['value']['objects'][objID] = {
	    "id": "#/VisualModel/groups/" + newID + "/objects/" + objID,
	    "modelID": "#/Model/Model/ModelObjects/" + newModelID,
	    "class": "Text",
	    "attr": {
			x: 5,
			y: 10,
			fontSize: 10,
			fontFamily: 'Calibri',
			fill: 'black',
			text: 'Person'
	  	},
	    "function": {},
	    "links": {"empty":""}
	}
	
	var trans = master.transaction.createTransaction( "VisualModel", visualActions, trans );
	
	master.transaction.processTransactions( trans );
	
	var actions = [
		{	"objectID" : "#/Model/Model/ModelObjects/" + newModelID,
			"commandType" : "update",
			"value" : {
			    "id": "#/Model/Model/ModelObjects/" + newModelID,
			    "name": "Person",
			    "type": "Object",
			    "notes": "",
			    "ModelRelationshipConnectors": { "empty":"" }
			}
		}
	]
	
	var trans2 = master.transaction.createTransaction( "Model", actions ); 

	var trans2 = master.transaction.createTransaction( "VisualModel", va2, trans2 );
	
	master.transaction.processTransactions( trans2 );
	
	var comment = [
		{	"objectID" : "#/VisualModel/comments/bc22185f-0d6c-468a-9267-54466f666821",
			"commandType" : "insert",
			"value" : {
			    "id": "#/VisualModel/comments/bc22185f-0d6c-468a-9267-54466f666821",
			    "selectedBy": "default",
			    "attr": {
					x: 100,
					y: 100,
					draggable: true
				},
			    "function": {},
			    "objects": {}
			}
		}
	]
	
	objID = uuid.v4();
	
	comment[0]['value']['objects'][objID] = {
	    "id": "#/VisualModel/comments/bc22185f-0d6c-468a-9267-54466f666821/objects/" + objID,
	    "class": "Rect",
	    "attr": {
			width: 40,
			height: 40,
			stroke: 'black',
			strokeWidth: 1,
			cornerRadius: 8,
			fill: 'yellow',
			name: 'content'
		},
	    "function": {},
	    "links": {"empty":""}
	}
	
	var trans3 = master.transaction.createTransaction( "VisualModel", comment );
	
	master.transaction.processTransactions( trans3 );
}

function modelLoaded( _i, _callback ){
	if( typeof master.model.loaded == 'boolean' && master.model.loaded ){
		onModelLoadedComplete();
		$('#transaction').html('');
	} else {
		_i++;
		setTimeout( 'modelLoaded( ' + _i + ' )', 500 );
	}
}