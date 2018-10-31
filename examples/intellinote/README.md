# IntelliNote

A simple application that allows the user to store some plain text in their account.

This is a full application that will work nearly entirely by itself, the only things you need to do is this:
- `Server.js:line 6` Email must be set to an email address *and* 3rd party applications *must* be enabled, if it is not gmail then line 4 needs to be changed as is relevant.
- `Server.js:line 7` The password for the given email address
- `Server.js:line 89` Should be the same as the email on line 6
- `Server.js:line 38` The path to the folder with `index.html` in it

That is all.


## What can be expected:
1. A user can sign up
2. An email will be sent to their account asking them to confirm the email address, nothing can be done until they do
3. After that the user will be able to write into the text box on the main page, this is persistent
4. Logging in from somewhere else will allow you too see and edit that same text
5. Clicking `Log Out` will delete the information regarding the login
6. 404 and 403 pages are present
7. Full CSS with responsive design
