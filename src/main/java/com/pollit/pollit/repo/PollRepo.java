package com.pollit.pollit.repo;

import com.pollit.pollit.model.Poll;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PollRepo extends JpaRepository<Poll, Integer> {
    Poll findByAlphaNumId(String alphaNumId);
}
