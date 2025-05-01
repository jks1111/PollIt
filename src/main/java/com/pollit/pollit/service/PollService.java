package com.pollit.pollit.service;

import com.pollit.pollit.model.Option;
import com.pollit.pollit.model.Poll;

import com.pollit.pollit.repo.PollRepo;
import com.pollit.pollit.utility.Base62Util;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;


@Service
public class PollService {
    @Autowired
    private   PollRepo repo;

    public Poll createPoll(Poll poll) {
        for (Option option : poll.getOptions()) {
            option.setPoll(poll);
        }
        Poll createdPoll = repo.save(poll);
        String AlphaNumId = Base62Util.encode(createdPoll.getId());
        createdPoll.setAlphaNumId(AlphaNumId);
        createdPoll = repo.save(createdPoll);
        return createdPoll;
    }

    public Poll getPollByAlphaNumId(String AlphaNumId) {
       return  repo.findByAlphaNumId(AlphaNumId);
    }

    public void savePoll(Poll poll) {
        repo.save(poll);
    }
}
