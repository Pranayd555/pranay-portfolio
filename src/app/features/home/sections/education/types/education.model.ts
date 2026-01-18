export interface IEducationSection {
    education: IEducationItem[];
    certifications: ICertification[];
}

export interface IEducationItem {
    id: string;
    degree: string;
    institution: string;
    completionDate: string;
    score?: IEducationScore;
}

export interface IEducationScore {
    label: string;      // GPA / Percentage
    value: string;      // "7.65" / "76.6"
    scale?: string;     // "CGPA", "100", optional
}

export interface ICertification {
    id: string;
    title: string;
    issuer?: string;
}
