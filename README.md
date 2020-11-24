Developers 
- assigned a service at random in the daytime. each service gets 2-3 people
- goal is to get the hacker fired


Hacker(s) 
- know who the other hackers are
- assigned a service to work on in the daytime (maybe can choose?) (1 hacker per service)
- can choose to hack a service during the night
- goal is to hack a service 3 times (whereupon it will be destroyed)


Tech lead???? (v2)
- is not known to any of the players except themselves
- tech lead can immunise a service during the night, preventing a hack
- if a hack is attempted on an immunised service, the people assigned to that service will know, but this is NOT announced to the group by the game

Night
- hackers collude and decide whether to act. if they hack an unimmunised service, the service loses 33% health
- tech lead can immunise a service. if that service is hacked, the hack fails and the service is not affected

Daytime
- everyone gets a pagerduty alert if a service is broken (the service that the hacker broke)
- people discuss who they think the hacker is
- vote on who gets fired
- people choose which service to work on (random for now)
- then it's nighttime


Game ends when a service is hacked 3 times (hackers win) or the hackers are fired (CtM wins).



# login page
Enter name

# game
the office UI 
player role in top right (hackers can see the other hackers)
time of day
voting interface



## TODO: 
socket idle timeout increase

show class specific UI showing:
  <!-- - player name  -->
  <!-- - player class -->
  <!-- - fix role display -->
  <!-- - see the 'office' with the services -->
  <!-- - display services -->
  -if you are a hacker, you should be able to see the button on the service your're in
  -if you are a hacker you are able to see other hackers (red border or smth)
  
  
  - see available actions?? (based on class)

night/day cycle



