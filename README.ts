System.InvalidOperationException: Unable to resolve service for type 'Ops.Services.DataService' while attempting to activate 'Ops.Controllers.HomeController'.
   at Microsoft.Extensions.DependencyInjection.ActivatorUtilities.ThrowHelperUnableToResolveService(Type type, Type requiredBy)
   at lambda_method2(Closure, IServiceProvider, Object[])



The whole workflow works in this manner. 

SIGN IN AND SIGN OUT
---------------------
Sign Up using either Apple , LinkedIn or Google 
Sing In Using either Apple , LinkedIn or Google 
Sign Out from Application


LOGO
-----
Design an Logo


There are only three sections 

1. Create Enhanced Resumes
2. My Resumes
3. Generated Resumes

Flow 
-----
Create Enhanced Resumes - New User who signs up for the first time
------------------------------------------------------------------
He should be seeing an Upload Resume page which prompts him to Upload a resume. (CREATE_NEW_USER_MUST_UPLOAD_RESUME_FIRST).

Without uploading an resume, he cannot go to the job description page. 
The first resume he uploads will be the voice fingerprint. Once he finish uploading the resume, he will be able to navigate to the Job Description page by clicking on upload Job Description button. 

After the Job Descripton page is complete and click on next, will navigate to Select your Resumes page where the user can toggle/select those resumes which he feels needs to be considered for the role. 

If there is only one resume, he cant to much and there will be atleast one resume which will be in this page and this is behind one final step before creating an resume (CREATE_SELECT_RESUMES). 

Once he clicks create resume from this page, he should be able to see the resume creating progression screen. (CREATE_ALL_USER_RESUME_CREATION_PROGRESS)

Streaming of Progress 
---------------------




What if the user is an returning user and has already some resumes uploaded?
----------------------------------------------------------------------------

Clicking on create enhanced resumes will navigate to the job description page ( CREATE_JOB_DESCRIPTION_PAGE )


My Resumes
----------
There is also an option to upload more resumes. This is by navigating to the My Resumes section. As of now, the limit is 5. This is a hard limit. Not more than 5 resumes can be uploaded. 

Clicking on this button should take us to the Resume management page (MY_RESUME_MGMT_PAGE_ONE_RESUME). 

But they can navigate to Generated Resumes
 




