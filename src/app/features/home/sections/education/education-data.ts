import { IEducationSection } from "./education.model";

export const educationData: IEducationSection = {
    "education": [
        {
            "id": "btech",
            "degree": "B. Tech",
            "institution": "West Bengal University of Technology",
            "completionDate": "Jan 2017",
            "score": {
                "label": "GPA",
                "value": "7.65",
                "scale": "CGPA"
            }
        },
        {
            "id": "wbchse",
            "degree": "W.B.C.H.S.E (Higher Secondary)",
            "institution": "Barasat P.C.S. Govt. High School",
            "completionDate": "Jan 2013",
            "score": {
                "label": "GPA",
                "value": "76.6"
            }
        }
    ],
    "certifications": [
        {
            "id": "angular-hackerrank",
            "title": "Angular Intermediate",
            "issuer": "HackerRank"
        },
        {
            "id": "angular-hkust",
            "title": "Front-end Javascript Frameworks: Angular",
            "issuer": "HKUST"
        },
        {
            "id": "modern-js-niiit",
            "title": "Building Interactive Web Pages Using Modern Javascript",
            "issuer": "NIIT"
        },
        {
            "id": "js-ucdavis",
            "title": "Javascript Basics",
            "issuer": "UC Davis"
        },
        {
            "id": "html-css-meta",
            "title": "HTML and CSS in depth",
            "issuer": "Meta"
        }
    ]
}
