FROM gcr.io/google.com/cloudsdktool/google-cloud-cli:stable

COPY deploy/firestore-backup.sh /usr/local/bin/firestore-backup.sh
RUN chmod +x /usr/local/bin/firestore-backup.sh

ENTRYPOINT ["/usr/local/bin/firestore-backup.sh"]
