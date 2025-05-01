package com.pollit.pollit.controller;

import com.pollit.pollit.model.Option;
import com.pollit.pollit.model.Poll;
import com.pollit.pollit.service.PollService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


import java.util.Map;

@RestController
@CrossOrigin
public class HomeController {

    @Autowired
    PollService pollService;

    @PostMapping("/polls")
    public ResponseEntity<Poll> createPoll(@RequestBody Poll poll) {
        Poll createdPoll = pollService.createPoll(poll);
        if(createdPoll==null) return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        return ResponseEntity.ok(createdPoll);
    }

    @GetMapping("/polls/{id}")
    public ResponseEntity<Poll> getPoll(@PathVariable String id) {
        Poll poll = pollService.getPollByAlphaNumId(id);
     //  Poll poll =  pollService.getPollById(id);
        if(poll!=null)
            return new ResponseEntity<>(poll,HttpStatus.OK);
        else
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }

    @PostMapping("/polls/{id}/vote")
    public ResponseEntity<Poll> votePoll(@PathVariable String id, @RequestBody Map<String, Integer> requestBody) {
        Poll poll =  pollService.getPollByAlphaNumId(id);
        if(poll==null) return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        Integer optionId = requestBody.get("optionId");

        for(Option option1 : poll.getOptions()){
             if(option1.getId() == optionId){
                 int vote = option1.getVote();
                 option1.setVote(vote + 1);
                 break;
             }
        }
        pollService.savePoll(poll);
        return new ResponseEntity<>(poll,HttpStatus.OK);
    }

    @GetMapping ("/polls/{id}/results")
    public ResponseEntity<Poll> getResults(@PathVariable String id) {
       Poll poll =  pollService.getPollByAlphaNumId(id);
        if(poll!=null)
            return new ResponseEntity<>(poll,HttpStatus.OK);
        else
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);

    }

}
