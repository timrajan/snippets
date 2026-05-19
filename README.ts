This page is a self-serve knowledge hub page for everything related to Puppeteer Automation Framework. The end user/audience You can have a look at this wiki page 
For the following objectives 

Objective one: to get to know how the framework works end to end, the mechanism involved, the controls, the way in which the controls hop inside the code
 objective two:  a guide to create the spreadsheets which run the whole of the test
 objective 3: To enhance/modify the core automation framework in future to accommodate any of the new features 


    The whole of this Automation framework can be divided into three major parts. 

        The first part is creating the spreadsheet, which can be easily  understood by the  puppeteer  automation framework.
    The second part is configuring test cases in ADO via scripts. 
The thirs part is  the Puppeteer Automation Framework which runs the configured test via the created Puppeteer framework. 


        Let's go through each of the moving parts separately in a very detailed manner.

 first part 

 the spreadsheet  this is the most important and the main driver of the whole automation framework. Without a valid spreadsheet, the framework cannot run. We need to make sure the spreadsheet is valid and guardrails need to be established so that we do not get into a situation where the whole test suite fails because the representation of data in the spreadsheet is not following a particular rule set 

based on the understanding of the existing testing process, we have introduced a couple of changes in the spreadsheet, which will be read by the Automation Framework. The following are the essential columns which need to be there in the spreadsheet 

 Test Case Sheet 
 a DOID 
case name 
 Field Level Validation
 Page Level Validation 
 Tooltip Text 
 tooltip text config 

 Question Sheet
 accessible names 
 action 
 Tooltip Texts 
Tooltip Text Validation 


 the second part is configuring test cases in ADO. This spreadsheet, which we have, has a column ADO ID, and we have another column which represents the test case name. When we configure this script to update or to sync the test cases in ADO 
