# Batch-Proxy-Checker-Node.js

I found it irretating that on OSX or Linux there isn't a simple batch proxy checker that allows me to test a list of proxy servers against a specific URL, so I made one doing just about that.

The "application" is relaying on Node.js. The default number of proxy servers being checked is 200. You may copy and paste all your proxy servers into "proxy.txt" and the application will remove checked proxy servers from proxy.txt and move them to "result.txt" if the proxy servers are working property.

You can open up "node.js" file and change the number of proxy servers being tested or the targeted URL. You may also change the keyword check on the Target Page, the default mode will skip the keyword check.
