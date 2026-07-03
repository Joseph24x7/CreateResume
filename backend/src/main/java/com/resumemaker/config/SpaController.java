package com.resumemaker.config;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class SpaController {

    @GetMapping(value = {"/", "/editor/**"})
    public String forward() {
        return "forward:/index.html";
    }
}
