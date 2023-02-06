package controllers

import (
	"encoding/json"
	"io/ioutil"
	"net/http"
	"ns-api/core/server/httpmessage"
	"regexp"
	"strings"
	"time"
)

type Commit struct {
	ShortId    string `json:"short_id"`
	Title      string `json:"title"`
	AuthorName string `json:"author_name"`
	WebUrl     string `json:"web_url"`
}

type CommitResponse struct {
	Type        string `json:"type"`
	Description string `json:"description"`
	Author      string `json:"author"`
	CommitHash  string `json:"commitHash"`
	Project     string `json:"project"`
}

type changelogResponse struct {
	Version string           `json:"version"`
	Date    int64            `json:"date"`
	Since   int64            `json:"-"`
	Changes []CommitResponse `json:"changes"`
}

const (
	PRIVATE_TOKEN     = "UJ7gyvChDxVpLWp1qwXf"
	PROJECT_SERVER_ID = "14243948"
	PROJECT_WEB_ID    = "14167778"
	PROJECT_BRANCH    = "develop" // released | master
)

var commitTypes = map[string]string{
	PROJECT_SERVER_ID: "API",
	PROJECT_WEB_ID:    "WEB",
}

func getCommits(id string, since string, until string) (commits []CommitResponse) {
	var respCommits []Commit
	client := &http.Client{}
	req, err := http.NewRequest("GET", "https://gitlab.com/api/v4/projects/"+id+"/repository/commits?ref_name="+PROJECT_BRANCH+"&all=true&per_page=100&since="+since+"T00:00:00.000-05:00&until="+until+"T00:00:00.000-05:00", nil)
	if nil != err {
		return
	}

	req.Header.Set("private-token", PRIVATE_TOKEN)
	response, err := client.Do(req)

	if nil != err {
		return
	}

	defer response.Body.Close()

	body, err := ioutil.ReadAll(response.Body)

	if err != nil {
		return
	}

	if 200 != response.StatusCode {
		return
	}

	_ = json.Unmarshal(body, &respCommits)

	for _, v := range respCommits {
		if !strings.HasPrefix(v.Title, "Merge branch") {
			project := commitTypes[id]
			commitType := getCommitType(v.Title)
			commits = append(commits, CommitResponse{
				Type:        commitType,
				Description: strings.Replace(v.Title, "["+commitType+"]", "", 1),
				Author:      v.AuthorName,
				CommitHash:  v.ShortId,
				Project:     project,
			})
		}
	}
	return commits
}

func getCommitType(str string) string {
	var re = regexp.MustCompile(`(?m)\[([^\]]+)\]`)
	match := re.FindAllStringSubmatch(str, -1)
	if len(match) > 0 && len(match[0]) > 1 {
		return match[0][1]
	}
	return ""
}

var changelog = []changelogResponse{
	{
		Version: "1.6.x",
		Date:    0,
		Since:   1585171800,
	},
	{
		Version: "1.6.66",
		Date:    1585171800,
		Since:   1584748800,
	},
	{
		Version: "1.6.21",
		Date:    1584748800,
		Since:   1584565200,
	},
	{
		Version: "1.6.0",
		Date:    1584565200,
		Since:   1583902800,
	},
	{
		Version: "1.5.15",
		Date:    1583902800,
		Since:   1583038800,
	},
}

func GetChangelog() httpmessage.HttpMessage {
	for i, change := range changelog {
		if 0 == len(change.Changes) || 0 == i {
			var until string
			since := time.Unix(change.Since, 0).Format("2006-01-02") // 2020-03-18T0:0:0.000-05:00

			if 0 == change.Date {
				changelog[i].Date = time.Now().Add(time.Hour * 24).Unix()
				until = time.Unix(changelog[i].Date, 0).Format("2006-01-02")
			} else {
				until = time.Unix(change.Date, 0).Format("2006-01-02")
			}

			changes := getCommits(PROJECT_SERVER_ID, since, until)
			changes = append(changes, getCommits(PROJECT_WEB_ID, since, until)...)
			changelog[i].Changes = changes
		}
	}

	return httpmessage.Send(&changelog)
}
