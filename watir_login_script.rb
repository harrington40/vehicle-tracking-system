require 'watir'

# Open a new browser using Chrome
browser = Watir::Browser.new :chrome

# Go to the login page
browser.goto 'http://localhost:3000/login'

# Enter email
browser.text_field(id: 'email').set 'hricks@go.com'

# Enter password
browser.text_field(id: 'password').set 'Cosinesine'

# Wait for the user to click the login button
puts "Please click the login button to proceed..."
browser.wait_until { browser.url != 'http://localhost:3000/login' }

# Print the title of the current page to confirm login success
puts "Logged in. Current page title: #{browser.title}"

# Close the browser
browser.close
